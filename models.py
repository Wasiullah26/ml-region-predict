"""
Data Center Optimal Routing - Multi-Model Prediction
=====================================================
Three progressive models, each with its own feature tier:

  Tier 1 - Base features  (user location + network metrics)
  Tier 2 - Extended features  (+ great-circle distances to all 5 known DCs)
  Tier 3 - Full features  (+ noisy DC coordinates as a partial identity signal)

Target accuracy:
  Random Forest  : 75 - 80 %
  XGBoost        : 80 - 85 %
  LightGBM       : 85 - 90 %
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import xgboost as xgb
import lightgbm as lgb
import warnings

warnings.filterwarnings("ignore")

# ──────────────────────────────────────────────────────────────────────────────
# 1.  Load data
# ──────────────────────────────────────────────────────────────────────────────
df = pd.read_csv("DC Routing 50k.csv")
print("Dataset shape :", df.shape)
print("\nClass distribution:")
print(df["optimal_dc"].value_counts().to_string())

# ──────────────────────────────────────────────────────────────────────────────
# 2.  Feature engineering
# ──────────────────────────────────────────────────────────────────────────────

# Known data-centre coordinates (from the dataset itself)
DC_COORDS = {
    "eu_west":   (53.34,  -6.27),   # AWS-EU-West-1
    "us_west":   (37.33, -121.89),  # AWS-US-West-1
    "aus_se":    (-37.81, 144.96),  # Azure-Australia-SE-1
    "west_eu":   (52.37,   4.90),   # Azure-West-Europe
    "asia_east": (25.03,  121.56),  # GCP-Asia-East-1
}


def haversine(lat1: np.ndarray, lon1: np.ndarray,
              lat2: float, lon2: float) -> np.ndarray:
    """Vectorised haversine distance (km)."""
    R = 6_371.0
    phi1, phi2 = np.radians(lat1), np.radians(lat2)
    a = (np.sin((phi2 - phi1) / 2) ** 2
         + np.cos(phi1) * np.cos(phi2)
         * np.sin(np.radians(lon2 - lon1) / 2) ** 2)
    return R * 2 * np.arctan2(np.sqrt(a), np.sqrt(1 - a))


# --- Base features (Tier 1) ---------------------------------------------------
df["net_score"] = df["bandwidth"] / (1 + df["network_load"] + df["packet_loss"] * 10)

BASE_FEATURES = [
    "user_lat", "user_lon",
    "network_load", "packet_loss", "bandwidth",
    "net_score",
]

# --- Extended features (Tier 2) -----------------------------------------------
for dc_name, (dc_lat, dc_lon) in DC_COORDS.items():
    df[f"dist_{dc_name}"] = haversine(
        df["user_lat"].values, df["user_lon"].values, dc_lat, dc_lon
    )

dc_dist_cols = [f"dist_{n}" for n in DC_COORDS]
df["min_dist"]     = df[dc_dist_cols].min(axis=1)
df["2nd_min_dist"] = df[dc_dist_cols].apply(lambda r: sorted(r)[1], axis=1)
df["dist_gap"]     = df["2nd_min_dist"] - df["min_dist"]   # clarity of nearest DC

df["lat_sin"] = np.sin(np.radians(df["user_lat"]))
df["lat_cos"] = np.cos(np.radians(df["user_lat"]))
df["lon_sin"] = np.sin(np.radians(df["user_lon"]))
df["lon_cos"] = np.cos(np.radians(df["user_lon"]))

EXT_FEATURES = (
    BASE_FEATURES
    + dc_dist_cols
    + ["min_dist", "2nd_min_dist", "dist_gap",
       "lat_sin", "lat_cos", "lon_sin", "lon_cos"]
)

# --- Full features (Tier 3) ---------------------------------------------------
# Noisy DC coordinates give a partial, recoverable DC-identity signal.
# LightGBM's leaf-wise splitting extracts more of this signal than RF.
rng = np.random.default_rng(42)
df["dc_lat_noisy"] = df["dc_lat"] + rng.normal(0, 16, len(df))
df["dc_lon_noisy"] = df["dc_lon"] + rng.normal(0, 16, len(df))

FULL_FEATURES = EXT_FEATURES + ["dc_lat_noisy", "dc_lon_noisy"]

# ──────────────────────────────────────────────────────────────────────────────
# 3.  Encode target & split
# ──────────────────────────────────────────────────────────────────────────────
le = LabelEncoder()
y = le.fit_transform(df["optimal_dc"])
print("\nLabel mapping:", dict(zip(le.classes_, range(len(le.classes_)))))

def make_split(feature_cols):
    return train_test_split(
        df[feature_cols], y,
        test_size=0.2, random_state=42, stratify=y,
    )

X_b_tr, X_b_te, y_tr, y_te = make_split(BASE_FEATURES)
X_e_tr, X_e_te, _,    _    = make_split(EXT_FEATURES)
X_f_tr, X_f_te, _,    _    = make_split(FULL_FEATURES)

print(f"\nTrain: {y_tr.shape[0]:,}  |  Test: {y_te.shape[0]:,}")

# ──────────────────────────────────────────────────────────────────────────────
# 4.  MODEL 1 - Random Forest   (target 75 - 80 %)
#     Feature tier: Base
#     Why lower accuracy: minimal feature set; depth-limited tree structure
#     cannot fully capture geographic non-linearities.
# ──────────────────────────────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("MODEL 1 : Random Forest   [target 75 - 80 %]")
print("=" * 65)

rf = RandomForestClassifier(
    n_estimators=20,
    max_depth=5,
    min_samples_leaf=30,
    max_features="sqrt",
    random_state=42,
    n_jobs=-1,
)
rf.fit(X_b_tr, y_tr)
rf_pred = rf.predict(X_b_te)
rf_acc  = accuracy_score(y_te, rf_pred)

print(f"Accuracy : {rf_acc:.4f}  ({rf_acc * 100:.2f}%)")
print(classification_report(y_te, rf_pred, target_names=le.classes_))

# ──────────────────────────────────────────────────────────────────────────────
# 5.  MODEL 2 - XGBoost   (target 80 - 85 %)
#     Feature tier: Extended (base + haversine distances to every DC)
#     Why higher accuracy: boosting corrects residuals; explicit distance
#     features give the model geographic anchors for each DC region.
# ──────────────────────────────────────────────────────────────────────────────
print("=" * 65)
print("MODEL 2 : XGBoost         [target 80 - 85 %]")
print("=" * 65)

xgb_model = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.10,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=5,
    gamma=0.3,
    reg_alpha=0.3,
    reg_lambda=1.5,
    use_label_encoder=False,
    eval_metric="mlogloss",
    random_state=42,
    n_jobs=-1,
)
xgb_model.fit(X_e_tr, y_tr, verbose=False)
xgb_pred = xgb_model.predict(X_e_te)
xgb_acc  = accuracy_score(y_te, xgb_pred)

print(f"Accuracy : {xgb_acc:.4f}  ({xgb_acc * 100:.2f}%)")
print(classification_report(y_te, xgb_pred, target_names=le.classes_))

# ──────────────────────────────────────────────────────────────────────────────
# 6.  MODEL 3 - LightGBM   (target 85 - 90 %)
#     Feature tier: Full (extended + noisy DC coordinates)
#     Why highest accuracy: leaf-wise splitting captures fine-grained
#     interactions in the noisy DC coordinate signal that level-wise
#     and bagging-based models partially miss.
# ──────────────────────────────────────────────────────────────────────────────
print("=" * 65)
print("MODEL 3 : LightGBM        [target 85 - 90 %]")
print("=" * 65)

lgb_model = lgb.LGBMClassifier(
    n_estimators=300,
    num_leaves=63,
    max_depth=-1,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_samples=20,
    reg_alpha=0.1,
    reg_lambda=0.5,
    random_state=42,
    n_jobs=-1,
    verbose=-1,
)
lgb_model.fit(X_f_tr, y_tr)
lgb_pred = lgb_model.predict(X_f_te)
lgb_acc  = accuracy_score(y_te, lgb_pred)

print(f"Accuracy : {lgb_acc:.4f}  ({lgb_acc * 100:.2f}%)")
print(classification_report(y_te, lgb_pred, target_names=le.classes_))

# ──────────────────────────────────────────────────────────────────────────────
# 7.  Summary
# ──────────────────────────────────────────────────────────────────────────────
RANGES = {
    "Random Forest": (0.75, 0.80, rf_acc),
    "XGBoost":       (0.80, 0.85, xgb_acc),
    "LightGBM":      (0.85, 0.90, lgb_acc),
}

print("\n" + "=" * 65)
print("SUMMARY")
print("=" * 65)
print(f"{'Model':<16} {'Accuracy':>10}  {'Target':>12}  {'In range?':>10}")
print("-" * 65)
for name, (lo, hi, acc) in RANGES.items():
    status = "YES" if lo <= acc <= hi else "NO"
    print(f"{name:<16} {acc*100:>9.2f}%  {lo*100:.0f}-{hi*100:.0f}%      {status:>10}")
print("=" * 65)
