# 🚀 Team Task Manager (TTM)

A modern, full-stack Task Management application built with **React**, **Node.js**, and **MongoDB**. This project features a clean, premium UI with role-based access control, a dynamic Kanban board, and real-time dashboard analytics.

---

## 🌟 Key Features

*   **Role-Based Access**:
    *   **Admins**: Create projects, manage team members, and oversee all tasks in the system.
    *   **Members**: View projects they are part of and manage their personal allotted tasks.
*   **Dynamic Kanban Board**: 2x2 grid layout (To Do, In Progress, Review, Done) with smooth drag-and-drop functionality.
*   **Smart Dashboard**: 
    *   Admins see a global overview of all system assignments.
    *   Members see a focused "My Assigned Tasks" view.
*   **Premium UI**: Glassmorphism effects, smooth animations, and a responsive sidebar layout.

---

## 🛠️ Tech Stack

*   **Frontend**: React.js, Vite, Tailwind CSS, Lucide Icons, TanStack Query.
*   **Backend**: Node.js, Express, Mongoose (MongoDB), JWT Authentication, Zod Validation.

---

## ⚙️ Installation & Setup

### 1. Prerequisites
*   Node.js (v18+)
*   MongoDB (Local or Atlas)

### 2. Backend Setup
```bash
cd backend
npm install
```
*   Create a `.env` file in the `backend` folder and add:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=development
```
*   Run the backend:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```
*   Create a `.env` file in the `frontend` folder and add:
```env
VITE_API_URL=http://localhost:5000/api
```
*   Run the frontend:
```bash
npm run dev
```

---

---

## 📂 Project Structure
```text
Team-Task-Manager/
├── backend/            # Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── scripts/    # Seed scripts
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/ # Reusable UI
│   │   ├── context/    # Auth state
│   │   └── pages/      # Dashboard, Projects, etc.
```

---
Built with ❤️ for team productivity.
