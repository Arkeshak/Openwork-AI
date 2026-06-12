# OpenWork AI

OpenWork AI is a powerful, modern, multi-tenant AI workspace and chat assistant. It integrates Next.js on the frontend, FastAPI on the backend, PostgreSQL (Neon) for application data, and ChromaDB for vector-based document retrieval (RAG).

## 🚀 Features

- **Multi-Tenant Workspaces**: Users can create isolated workspaces for different projects.
- **Document-Aware Chat (RAG)**: Upload documents (PDFs, TXT, etc.) to a workspace, and chat with an AI assistant that references the documents to answer questions.
- **JWT Authentication**: Secure user registration, login, and token-based API access.
- **Modern UI/UX**: Sleek Next.js frontend built with responsive layouts, dark mode support, and interactive chat interfaces.
- **FastAPI Backend**: High-performance, asynchronous REST API with auto-generated Swagger documentation.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 15+, Tailwind CSS, React, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, Alembic, Uvicorn
- **Database**: PostgreSQL (hosted on Neon)
- **Vector Database**: ChromaDB (for local embedding storage and search)
- **AI Engine**: Google Gemini API

---

## 💻 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- PostgreSQL Database (e.g., [Neon.tech](https://neon.tech/))

---

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory:
   ```env
   PROJECT_NAME="OpenWork AI"
   VERSION="0.1.0"
   ENVIRONMENT="development"
   DATABASE_URL="your-postgresql-database-url"
   JWT_SECRET="your-jwt-secret-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```

5. **Initialize Database Tables**:
   Run the backend server (see below), open `http://127.0.0.1:8000/docs`, and trigger the `POST /database/create` endpoint.

6. **Run the server**:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will run at `http://127.0.0.1:8000`.

---

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the `frontend/` directory if you need to point to a custom API URL (defaults to `http://127.0.0.1:8000`).

4. **Run the development server**:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:3000`.

---

## 📚 API Documentation

FastAPI provides interactive API docs out of the box. Once the backend server is running, visit:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
