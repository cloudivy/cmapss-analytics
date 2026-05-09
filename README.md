# CMAPSS FD001 — Fault Detection Analytics

A React dashboard for fault detection analytics on the NASA CMAPSS turbofan engine dataset (FD001 subset).

## Features
- Fleet overview — all 100 engines colour-coded by fault zone
- Per-unit sensor trend charts
- RUL (Remaining Useful Life) visualisation with fault zone thresholds
- Fault zone classification: Healthy / Degrading / Critical

## Setup

### 1. Add the dataset
Place the processed JSON files in the `data/` folder:
```
data/
├── train_FD001.json
└── test_FD001.json
```

To generate these from the raw NASA files, run:
```bash
pip install pandas
python scripts/preprocess_fd001.py
```

### 2. Install and run
```bash
npm install
npm run dev
```

### 3. Build for production
```bash
npm run build
```

## Data
Raw dataset: [NASA CMAPSS](https://www.nasa.gov/intelligent-systems-division/discovery-and-systems-health/pcoe/pcoe-data-set-repository/)

The raw `.txt` files are **not** included in this repository (see `.gitignore`).
Processed JSON files go directly in `/data`.

## Fault Zone Thresholds
| Zone | RUL Range |
|------|-----------|
| Healthy | > 80 cycles |
| Degrading | 31–80 cycles |
| Critical | ≤ 30 cycles |
