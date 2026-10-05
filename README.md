# HuntJobsC 🚀

HuntJobsC est une plateforme moderne de recrutement et de gestion des offres d'emploi, candidatures et matching intelligent.

---

## 🛠️ Architecture & Technologies

- **Backend** : Django / Django REST Framework, SimpleJWT, Python 3.12+
- **Frontend** : React 19, Vite, Lucide Icons, Vanilla CSS moderne & responsive
- **Base de données** : SQLite (dev) / PostgreSQL (prod)

---

## 📁 Structure du projet

```
HuntJobsC/
├── backend/            # API REST Django (users, offres, candidatures, ia, plateforme)
├── frontend/           # Application web React + Vite
├── docs/               # Documentation et audits
├── run_platform.py     # Script de démarrage unifié (Backend + Frontend)
├── stop_platform.py    # Script d'arrêt
└── start_huntjobs.cmd  # Lanceur rapide Windows
```

---

## 🚀 Démarrage Rapide

### 1. Démarrage unifié (Recommandé)

```bash
python run_platform.py
```
Ce script lance automatiquement le serveur backend Django sur `http://localhost:8000` et le frontend Vite sur `http://localhost:5173`.

### 2. Démarrage manuel

#### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Sécurité et Bonnes Pratiques

- Les fichiers d'environnement (`.env`), la base de données locale (`*.sqlite3`) et les dossiers de dépendances (`node_modules`, `venv`) sont exclus du versioning via `.gitignore`.
