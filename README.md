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
- **Database**: SQLite / PostgreSQL (Configurable via SQLAlchemy engine)
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

### 2. Backend Setup
Navigate to the backend directory and set up your Python virtual environment.
