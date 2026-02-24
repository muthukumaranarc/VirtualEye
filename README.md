# VirtualEye — AI Surveillance Platform

> **Module 1 — Base Architecture Foundation**

A full-stack AI surveillance web application built with React (Vite) + Flask + MongoDB Atlas.

---

## Project Structure

```
virtualeye/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # App factory (create_app)
│   │   ├── config.py            # Environment-based configuration
│   │   ├── extensions.py        # PyMongo + CORS initialisation
│   │   ├── routes/
│   │   │   └── health_routes.py # GET /api/health
│   │   ├── models/              # (Module 2+)
│   │   ├── services/            # (Module 2+)
│   │   └── utils/               # (Module 2+)
│   ├── run.py                   # Flask entry point (port 5000)
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root app shell (navbar + routing)
│   │   ├── App.css              # App shell styles
│   │   ├── api/
│   │   │   └── apiClient.js     # Axios client + health helper
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main dashboard page
│   │   │   └── Dashboard.css
│   │   └── styles/
│   │       └── global.css       # Design system (tokens, utils, animations)
│   ├── index.html
│   ├── package.json
│   └── .env.example
│
└── README.md
```

---

## Prerequisites

| Requirement | Version     |
|-------------|-------------|
| Python      | 3.10+       |
| Node.js     | 18+         |
| npm         | 9+          |
| MongoDB Atlas | Any free-tier cluster |

---

## 1 · Backend Setup

### Install Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt
```

### Configure Environment Variables

```bash
# Copy the example and fill in your MongoDB Atlas URI
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `backend/.env`:

```env
VIRTUALEYE_MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
VIRTUALEYE_BACKEND_URL=http://localhost:5000
VIRTUALEYE_FRONTEND_URL=http://localhost:5173
VIRTUALEYE_SECRET_KEY=your-secret-key-here
```

### Run the Backend

```bash
# From the backend/ directory (with venv activated)
python run.py
```

The Flask server starts on **http://localhost:5000**.

#### Verify

```
GET http://localhost:5000/api/health
→ {"status": "ok", "service": "VirtualEye backend"}
```

---

## 2 · Frontend Setup

### Configure Environment Variables

```bash
cd frontend
copy .env.example .env   # Windows
# cp .env.example .env   # macOS/Linux
```

Edit `frontend/.env`:

```env
VITE_VIRTUALEYE_BACKEND_URL=http://localhost:5000
```

### Install Dependencies

```bash
npm install
```

### Run the Frontend

```bash
npm run dev
```

The React app is served on **http://localhost:5173**.

---

## 3 · Running Both Together

Open two terminal windows:

**Terminal 1 — Backend**
```bash
cd backend
venv\Scripts\activate
python run.py
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173** in your browser.

You should see the **VirtualEye Dashboard** with the **Backend Status: Online** indicator.

---

## API Reference

| Method | Endpoint      | Description               |
|--------|---------------|---------------------------|
| GET    | `/api/health` | Backend health check      |

> More endpoints will be added in **Module 2 — Authentication System**.

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable                  | Required | Description                         |
|---------------------------|----------|-------------------------------------|
| `VIRTUALEYE_MONGODB_URI`  | ✅        | MongoDB Atlas connection string      |
| `VIRTUALEYE_BACKEND_URL`  | ✅        | Public URL of the Flask backend      |
| `VIRTUALEYE_FRONTEND_URL` | ✅        | Public URL of the React frontend     |
| `VIRTUALEYE_SECRET_KEY`   | ✅        | Flask secret key                     |

### Frontend (`frontend/.env`)

| Variable                         | Required | Description                  |
|----------------------------------|----------|------------------------------|
| `VITE_VIRTUALEYE_BACKEND_URL`    | ✅        | Backend URL for Axios client  |

---

## Modules Roadmap

| Module | Title                          | Status        |
|--------|--------------------------------|---------------|
| 1      | Base Architecture Foundation   | ✅ **Complete** |
| 2      | Authentication (Basic + OAuth) | 🔜 Coming next |
| 3      | Camera Management              | 🔜 Planned     |
| 4      | Real-time AI Surveillance      | 🔜 Planned     |
| 5      | Alerts & Notifications         | 🔜 Planned     |
| 6      | Analytics Dashboard            | 🔜 Planned     |

---

## License

MIT © VirtualEye Project
