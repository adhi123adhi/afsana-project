# CattleAI — Real-Time Indian Cattle Breed Recognition System

> Deep Learning (MobileNetV2 Transfer Learning) + Flask API + React UI

---

## 🚀 Quick Start

### 1. Backend (Python / Flask)

```bash
cd backend
python -m venv venv
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

API runs at **http://localhost:5000**

---

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

UI opens at **http://localhost:3000**

---

## 🧠 Training Your Own Model

### Prepare Dataset
```
backend/data/
  train/
    Gir/          ← put Gir cow images here
    Sahiwal/
    Jersey/
    ...
  val/
    Gir/
    Sahiwal/
    ...
```

### Run Training
```bash
cd backend
python train_model.py --data_dir ./data --epochs 20
```

### Quick Test (Mock Dataset)
```bash
python train_model.py --mock --epochs 3
```

Trained model saved to `backend/model/cattle_model.h5`

---

## 📡 API Reference

### `GET /` — Health check
```json
{ "status": "ok", "message": "Cattle Breed Recognition API is running" }
```

### `POST /predict` — Identify breed
- **Input:** `multipart/form-data` with field `image`
- **Output:**
```json
{
  "breed": "Gir",
  "confidence": 91.24,
  "info": { "origin": "Gujarat, India", "milk_yield": "8–10 litres/day", "description": "..." },
  "top3": [
    { "breed": "Gir", "confidence": 91.24 },
    { "breed": "Sahiwal", "confidence": 5.11 },
    { "breed": "Kankrej", "confidence": 2.30 }
  ],
  "model_status": "mock"
}
```

### `GET /breeds` — List all supported breeds
```json
{ "breeds": ["Gir", "Sahiwal", ...], "info": { ... } }
```

---

## 🐄 Supported Breeds (10 Classes)

| Breed | Origin | Milk Yield |
|-------|--------|------------|
| Gir | Gujarat, India | 8–10 L/day |
| Sahiwal | Punjab | 10–16 L/day |
| Tharparkar | Rajasthan | 6–8 L/day |
| Rathi | Rajasthan | 6–8 L/day |
| Ongole | Andhra Pradesh | 3–6 L/day |
| Kankrej | Gujarat | 4–6 L/day |
| Hallikar | Karnataka | 3–5 L/day |
| Holstein Friesian | Netherlands | 20–30 L/day |
| Jersey | Jersey Island | 12–18 L/day |
| Red Sindhi | Sindh/India | 8–12 L/day |

---

## ⚡ Features

- 📸 Upload image or use webcam
- 🤖 MobileNetV2 transfer learning model
- 📊 Confidence score + top-3 predictions
- 🔊 Text-to-Speech output (English + Tamil)
- 🌐 Bilingual UI (English / Tamil)
- ⚡ <2 second inference time
- 🌙 Dark glassmorphism design

---

## 📂 Project Structure

```
afsana ds project/
├── backend/
│   ├── app.py            ← Flask API
│   ├── utils.py          ← Preprocessing helpers
│   ├── train_model.py    ← Training script
│   ├── requirements.txt
│   └── model/
│       └── cattle_model.h5   ← Place trained model here
└── frontend/
    ├── public/index.html
    └── src/
        ├── App.js
        ├── index.js
        ├── index.css
        └── components/
            ├── Upload.js
            ├── Camera.js
            └── Result.js
```

---

## 🔧 Environment Variables

Create `frontend/.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

---

## 📦 Dataset Sources

- Kaggle: search "Indian cattle breed dataset"
- [Roboflow](https://roboflow.com) – cattle detection datasets
- ICAR (Indian Council of Agricultural Research) open datasets

---

## 🏆 Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Model | TensorFlow / Keras + MobileNetV2 |
| Backend | Python 3.9+ / Flask |
| Frontend | React 18 |
| Styling | Vanilla CSS (Glassmorphism) |
| TTS | Web Speech API |
