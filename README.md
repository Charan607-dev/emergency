# 🚑 Emergency SOS & Driver Dispatch Terminal

An end-to-end Crisis Management and Emergency Response prototype. This project connects citizens in distress, hospital command centers, and ambulance drivers in real time.

---

## 🌟 Key Features

* **📱 Citizen SOS Trigger:** Allows users to send emergency alerts with real-time GPS geolocation and contact info with a single tap.
* **🏥 Hospital Dispatch Dashboard:** Live control panel for hospital staff to view incoming SOS alerts and assign available ambulances.
* **🚚 Driver Telematics Terminal:** Animated React interface (featuring custom Canvas Wave Background) for ambulance drivers to track assigned patients and mark trips as complete, automatically updating vehicle availability.
* **💾 Zero-DB Prototype Setup:** Uses a lightweight JSON storage utility (`data.json`) so you can run and test the complete pipeline instantly without configuring external databases.

---

## 🛠️ Tech Stack

* **Frontend:** React, HTML5 / CSS3 (Glassmorphism), Lucide React Icons, HTML5 Canvas Animation.
* **Backend:** Node.js, Express.js.
* **Storage:** JSON File System (`fs`) Database Engine.

---

## 📂 Project Architecture

```text
emergency-response-prototype/
│
├── data/
│   └── data.json                  # Prototype JSON database
│
├── server/
│   ├── routes/
│   │   ├── sosRoutes.js           # API endpoints (/trigger, /assign, /complete)
│   │   └── hospitalRoutes.js      # API endpoints (/alerts, /ambulances)
│   ├── utils/
│   │   └── jsonStorage.js         # JSON read/write helper
│   └── server.js                  # Main Express app
│
├── public/
│   ├── user/                      # Citizen SOS App
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   │
│   ├── hospital/                  # Hospital Control Dashboard
│   │   ├── index.html
│   │   ├── style.css
│   │   └── dashboard.js
│   │
│   └── driver/                    # Driver Dispatch Terminal
│       ├── index.html
│       ├── style.css
│       └── app.js
│
├── src/
│   └── DriverTerminal.jsx         # React Driver Terminal Component with Wave Background
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🚀 Quick Setup Guide

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
cd YOUR_REPOSITORY_NAME
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm start
# or for live reload:
npm run dev
```

---

## 🌐 Application URLs

Once the server is running on `http://localhost:5000`:

* **Citizen SOS Page:** `http://localhost:5000/user`
* **Hospital Control Dashboard:** `http://localhost:5000/hospital`
* **Driver Terminal:** `http://localhost:5000/driver`

---

## 🔄 End-to-End Test Workflow

1. **Trigger Alert:** Open `http://localhost:5000/user` and click **TRIGGER SOS**.
2. **Assign Ambulance:** Open `http://localhost:5000/hospital`. You will see the new alert in **Incoming SOS Alerts**. Select an available ambulance and click **Assign & Dispatch**.
3. **Driver Pickup:** Open `http://localhost:5000/driver`. The selected vehicle status updates to **DISPATCHED** with patient details.
4. **Complete Trip:** On the Driver Terminal, click **Mark as Reached & Available**. The ambulance instantly becomes **AVAILABLE** again on the Hospital Dashboard.

---

## 📡 API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sos/trigger` | Triggers a new emergency SOS request |
| `GET` | `/api/hospital/:id/alerts` | Fetches pending alerts for a hospital |
| `GET` | `/api/hospital/:id/ambulances` | Fetches available ambulances |
| `POST` | `/api/sos/assign` | Assigns an ambulance to an SOS alert |
| `POST` | `/api/sos/complete` | Marks a trip complete and resets vehicle status |
