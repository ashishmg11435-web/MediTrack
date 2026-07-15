# 🏥 MediTrack

MediTrack is a comprehensive, full-stack healthcare management application designed to help patients effortlessly track their medical history, manage daily medications, schedule appointments, and receive personalized health insights.

## ✨ Features

- **🔐 Secure User Authentication**: Register, login, and manage your account securely using JWT-based authentication.
- **👤 Patient Profiles**: Store and update vital statistics including age, blood group, height, weight, and allergies.
- **📋 Medical Records**: Keep a digital log of all hospital visits, diagnoses, doctor's notes, and visit dates.
- **💊 Medicine Tracker**: Manage active prescriptions, track dosages, frequencies, and duration of treatments.
- **📅 Appointment Scheduling**: Schedule and monitor upcoming doctor appointments, including their current status (Scheduled, Cancelled, Completed).
- **🧠 Health Insights**: Dedicated insights dashboard (powered by Markdown integration) to view summarized health reports.

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Routing**: React Router DOM (v7)
- **Icons**: Lucide React
- **Markdown Rendering**: React Markdown & Remark GFM

### Backend
- **Framework**: FastAPI (Python)
- **Database ORM**: SQLAlchemy
- **Database**: MySQL
- **CORS**: FastAPI CORSMiddleware enabled for seamless frontend communication

---

## 🚀 Getting Started

Follow these instructions to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Python](https://www.python.org/) (v3.9 or higher)
- Git

### 1. Clone the repository
```bash
git clone https://github.com/ashishmg11435-web/MediTrack.git
cd MediTrack
```

### 2. Backend Setup
Navigate to the backend directory and set up your Python virtual environment.

```bash
cd backend

# Create a virtual environment
python -m venv myenv

# Activate the virtual environment
# On Windows:
myenv\Scripts\activate
# On Mac/Linux:
source myenv/bin/activate

# Install dependencies (assuming you have a requirements.txt)
pip install -r requirements.txt

# Start the FastAPI server
uvicorn main:app --reload
```
*The backend API will now be running on `http://localhost:8000`. You can view the automatic API documentation at `http://localhost:8000/docs`.*

### 3. Frontend Setup
Open a new terminal window, navigate to the frontend directory, and start the Vite development server.

```bash
cd frontend

# Install Node modules
npm install

# Start the React development server
npm run dev
```
*The frontend application will now be running on `http://localhost:5173`.*

---

## 📂 Project Structure

```text
MediTrack/
├── backend/
│   ├── main.py            # FastAPI application entry point & CORS configuration
│   ├── models.py          # SQLAlchemy database models (User, Profile, Records, etc.)
│   ├── routes.py          # API endpoint definitions
│   ├── schemas.py         # Pydantic data validation schemas
│   ├── database.py        # Database connection and session management
│   └── auth.py            # JWT Authentication logic
│
└── frontend/
    ├── package.json       # React dependencies and scripts
    ├── vite.config.js     # Vite configuration
    └── src/
        ├── App.jsx        # Main application routing (Protected Routes)
        ├── api.js         # Axios/Fetch configurations for backend communication
        ├── components/    # Reusable UI components (Navbar, ProtectedRoute)
        ├── pages/         # Application Views (Dashboard, Appointments, Insights, etc.)
        └── styles.css     # Global application styles
```

## 📜 License

This project is open-source and available under the [MIT License](LICENSE).
