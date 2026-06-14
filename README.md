# 🌌 OpenWork AI

![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?style=for-the-badge&logo=postgresql)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel)
![Railway](https://img.shields.io/badge/Deployed_on-Railway-131415?style=for-the-badge&logo=railway)

**OpenWork AI** is a state-of-the-art, multi-tenant AI workspace platform that seamlessly blends document management with intelligent, context-aware conversational AI. Built to transform static archives into dynamic, queryable knowledge bases.

---

## ✨ Key Features

- **🧠 Retrieval-Augmented Generation (RAG)**
  Upload PDFs, TXTs, and other documents into your workspace. The platform processes, chunks, and vectorizes your data using **ChromaDB**, allowing the AI to answer complex questions with precise, document-backed context.
  
- **🏢 Multi-Tenant Workspaces**
  Keep your data organized. Create distinct, isolated workspaces for different projects, teams, or clients. Documents uploaded to one workspace remain siloed from others.

- **⚡ Blazing Fast Architecture**
  Built on an asynchronous **FastAPI** backend for maximum throughput and low latency, paired with a modern, server-rendered **Next.js** frontend.

- **🎨 Premium UI/UX**
  A breathtaking, meticulously crafted user interface featuring sleek animations (Framer Motion), dark mode, glassmorphism elements, and responsive layouts tailored for all screen sizes.

- **🔒 Secure Authentication**
  Robust JWT-based authentication ensures your workspaces and documents are securely accessible only to authorized users.

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework:** Next.js 15+ (App Router)
- **Styling:** Vanilla CSS & Tailwind CSS for utility magic
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Deployment:** Vercel

### **Backend**
- **Framework:** FastAPI (Python)
- **Database ORM:** SQLAlchemy with Alembic for migrations
- **Vector Database:** ChromaDB
- **LLM Engine:** Google Gemini API
- **Deployment:** Railway

### **Infrastructure**
- **Primary Database:** PostgreSQL (hosted on Neon.tech)

---

## 🚀 Live Deployment

- **Frontend:** Deployed globally on [Vercel](https://vercel.com).
- **Backend API:** Deployed on [Railway](https://railway.app).

---

## 💻 Local Development Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **PostgreSQL Database** (e.g., [Neon.tech](https://neon.tech/))
- **Google Gemini API Key**

---

### 2. Backend Setup
1. **Navigate and Initialize:**
   ```bash
   cd backend
   python -m venv venv
   ```
2. **Activate Virtual Environment:**
   - Windows: `.\venv\Scripts\Activate.ps1`
   - Mac/Linux: `source venv/bin/activate`
3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
4. **Environment Variables:** Create a `.env` file in the `backend/` directory:
   ```env
   PROJECT_NAME="OpenWork AI"
   VERSION="0.1.0"
   ENVIRONMENT="development"
   DATABASE_URL="your-postgresql-database-url"
   JWT_SECRET="your-jwt-secret-key"
   GEMINI_API_KEY="your-gemini-api-key"
   ```
5. **Run the API:**
   ```bash
   uvicorn app.main:app --reload
   ```
   *The Swagger API documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).*

---

### 3. Frontend Setup
1. **Navigate and Install:**
   ```bash
   cd frontend
   npm install
   ```
2. **Environment Variables:** Create a `.env.local` file in the `frontend/` directory:
   ```env
   NEXT_PUBLIC_API_URL=/api
   BACKEND_URL=http://127.0.0.1:8000
   ```
3. **Run the App:**
   ```bash
   npm run dev
   ```
   *The application will be running at [http://localhost:3000](http://localhost:3000).*

---

## 🏗️ Architecture Overview

1. **User Interaction**: Users access the Next.js frontend, creating workspaces and uploading files.
2. **Document Processing**: The FastAPI backend receives the files, extracts the text, and splits it into logical chunks.
3. **Vectorization**: Chunks are embedded and stored in a local ChromaDB instance.
4. **Contextual Chat**: When a user queries the AI, the backend performs a similarity search on ChromaDB, retrieves the most relevant chunks, and injects them into the prompt for the Google Gemini API, ensuring accurate, context-aware responses.

---

## 👨‍💻 Developed By

**[@arkeshak](https://github.com/Arkeshak)**

*Building intelligent, modern solutions.*
