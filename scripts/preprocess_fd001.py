import pandas as pd
import json
import os

COLUMNS = [
    "unit", "cycle",
    "op1", "op2", "op3",
    "s1","s2","s3","s4","s5","s6","s7",
    "s8","s9","s10","s11","s12","s13","s14",
    "s15","s16","s17","s18","s19","s20","s21"
]
USEFUL_SENSORS = ["s2","s3","s4","s7","s8","s11","s12","s13","s14","s15","s17","s20","s21"]

def fault_zone(rul):
    if rul <= 30:  return "critical"
    if rul <= 80:  return "degrading"
    return "healthy"

def convert_train(input_path, output_path):
    df = pd.read_csv(input_path, sep=r"\s+", header=None, names=COLUMNS)
    max_cycle = df.groupby("unit")["cycle"].max()
    df["RUL"] = df.apply(lambda r: max_cycle[r["unit"]] - r["cycle"], axis=1)
    df["fault_zone"] = df["RUL"].apply(fault_zone)
    result = df[["unit","cycle","RUL","fault_zone"] + USEFUL_SENSORS]
    result.to_json(output_path, orient="records", indent=2)
    print(f"train done → {len(result)} rows → {output_path}")

def convert_test(test_path, rul_path, output_path):
    df = pd.read_csv(test_path, sep=r"\s+", header=None, names=COLUMNS)
    rul_df = pd.read_csv(rul_path, header=None, names=["RUL_final"])
    rul_df["unit"] = rul_df.index + 1
    last_cycle = df.groupby("unit")["cycle"].max().reset_index()
    last_cycle.columns = ["unit", "last_cycle"]
    df = df.merge(last_cycle, on="unit").merge(rul_df, on="unit")
    df["RUL"] = df["RUL_final"] + (df["last_cycle"] - df["cycle"])
    df["fault_zone"] = df["RUL"].apply(fault_zone)
    result = df[["unit","cycle","RUL","fault_zone"] + USEFUL_SENSORS]
    result.to_json(output_path, orient="records", indent=2)
    print(f"test done  → {len(result)} rows → {output_path}")

if __name__ == "__main__":
    os.makedirs("data", exist_ok=True)
    convert_train("data/raw/train_FD001.txt", "data/train_FD001.json")
    convert_test("data/raw/test_FD001.txt", "data/raw/RUL_FD001.txt", "data/test_FD001.json")
