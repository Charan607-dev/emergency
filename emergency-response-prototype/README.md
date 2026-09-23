# 🚑 Emergency SOS & Hospital Ambulance Dispatch Prototype

An end-to-end emergency response prototype connecting citizens in distress with hospital emergency departments. When a user triggers an SOS, their GPS location and details are sent in real-time to the hospital dashboard, enabling hospital staff to immediately assign and dispatch available ambulances.

---

## 🌟 Key Features

- **📱 Victim / Citizen Mobile Interface (`/user`)**:
  - One-tap Emergency SOS trigger.
  - Automatic browser GPS Geolocation capture (with fallback coordinates).
  - Real-time status tracker (polling updates until an ambulance is assigned).
  - Displays assigned vehicle number and driver contact details upon dispatch.

- **🏥 Hospital Dispatch Dashboard (`/hospital`)**:
  - Live incoming emergency alerts list.
  - Real-time view of available ambulances and driver info.
  - One-click ambulance assignment & dispatch workflow.
  - Periodic auto-refresh every 5 seconds.

- **⚡ Lightweight Backend**:
  - Node.js & Express RESTful API.
  - File-based JSON database (`data/data.json`) for zero-database configuration.
  - Pre-configured `.env` setup ready for AI integrations (Gemini, OpenAI, etc.).

---

## 📁 Project Structure

```text
emergency-response-prototype/
│
├── data/
│   └── data.json                   # Local JSON database (hospitals, ambulances, requests)
│
├── server/
│   ├── config/
│   │   └── constants.js            # Port, paths, and .env configuration
│   ├── utils/
│   │   └── jsonStorage.js          # Helper functions to read/write JSON safely
│   ├── routes/
│   │   ├── sosRoutes.js            # Endpoints: /api/sos/trigger, /api/sos/assign
│   │   └── hospitalRoutes.js       # Endpoints: /api/hospital/:id/alerts, /api/hospital/:id/ambulances
│   └── server.js                   # Express application entry point
│
├── public/
│   ├── user/                       # User / Victim Side (Mobile-friendly web app)
│   │   ├── index.html              # SOS button interface
│   │   ├── style.css               # Clean, urgent mobile styles
│   │   └── app.js                  # Geolocation handling & status polling
│   │
│   └── hospital/                   # Hospital Dashboard Side (Admin web app)
│       ├── index.html              # Incoming alerts & ambulance dispatch UI
│       ├── style.css               # Responsive dashboard layout
│       └── dashboard.js            # Alerts polling & ambulance assignment logic
│
├── .env                            # Environment variables (API keys, Port) [Ignored by Git]
├── .gitignore                      # Git ignore rules (node_modules, .env, logs)
├── package.json                    # Project dependencies & scripts
└── README.md                       # Documentation & setup guide
```

---

## 🚀 Getting Started (Setup for New Users)

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (version 16 or newer recommended)
- `npm` (comes bundled with Node.js)

---

### Step 1: Clone or Navigate to the Project

Open your terminal or command prompt and change directory to the project folder:

```bash
cd emergency-response-prototype
```

---

### Step 2: Install Dependencies

Install the required npm packages:

```bash
npm install
```

---

### Step 3: Configure Environment Variables (`.env`)

A `.env` file is already created in the project root. Open it in your text editor:

```env
# AI API Configuration (Optional / if integrating AI features)
AI_API_KEY=your_api_key_here
GEMINI_API_KEY=
OPENAI_API_KEY=

# Server Port
PORT=5000
```

> **Note:** If you don't need AI features right now, you can leave the keys blank and the prototype will function normally.

---

### Step 4: Start the Server

Run the start command:

```bash
npm start
```

Or run in development mode with auto-reload (Node 18+):

```bash
npm run dev
```

You should see output similar to:
```text
🚀 Prototype running on http://localhost:5000
📱 User SOS Page: http://localhost:5000/user
🏥 Hospital Dashboard: http://localhost:5000/hospital
```

---

## 🖥️ How to Test the Workflow

1. **Open the Hospital Dashboard**:
   - Open a browser tab to [http://localhost:5000/hospital](http://localhost:5000/hospital).
   - You should see available ambulances (e.g. Ramesh Kumar, Suresh Roy).

2. **Open the User SOS Screen**:
   - Open a second browser window or phone tab to [http://localhost:5000/user](http://localhost:5000/user).
   - Enter your name and phone number.
   - Click the big red **TRIGGER SOS** button (allow location access if prompted).

3. **Dispatch the Ambulance**:
   - Switch back to the **Hospital Dashboard** tab.
   - Notice the new incoming SOS alert card with patient name and coordinates.
   - Select an available ambulance from the dropdown and click **Assign & Dispatch**.

4. **Observe Victim Confirmation**:
   - Return to the **User SOS Page**.
   - Within 3 seconds, the UI will update to show:  
     `🚨 Ambulance Dispatched & On The Way!` with driver contact details.

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/sos/trigger` | Triggers a new emergency alert with user details & coordinates |
| `POST` | `/api/sos/assign` | Assigns an available ambulance to an active SOS request |
| `GET` | `/api/hospital/:hospital_id/alerts` | Fetches pending emergency alerts for a hospital |
| `GET` | `/api/hospital/:hospital_id/ambulances` | Fetches currently available ambulances for a hospital |

---

## ⚙️ Resetting Data

If you dispatched all ambulances and want to reset the prototype to its initial state:
1. Open [`data/data.json`](file:///c:/Users/ADMIN/emergency/emergency/emergency-response-prototype/data/data.json).
2. Set ambulance statuses back to `"AVAILABLE"`.
3. Clear the `"sos_requests"` array back to `[]`.