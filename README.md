# Advanced Self-Reflective RAG Pipeline

An end-to-end, production-ready Retrieval-Augmented Generation (RAG) application that indexes video subtitles into Pinecone, performs multi-query expansion with step-back prompting, evaluates and self-corrects answer quality in an automated loop, and provides exact human-readable video timestamps (`hh:mm:ss`) inside a surreal minimalist chat interface.

---

## 🌟 Key Features

### 🧠 Advanced RAG Architecture (Backend)
- **Input Guardrails**: Uses `gpt-4o-mini` to evaluate user input safety and intent before processing.
- **Step-Back Prompting**: Generates high-level concept queries to expand vector retrieval depth.
- **Sub-Question Decomposition**: Automatically splits complex user questions into up to 4 focused sub-queries.
- **Pinecone Integrated Inference**: Performs batch vector upserts and multi-query text searches against Pinecone vector namespaces.
- **Human-Readable Timestamps**: Formats subtitle timestamp metadata into `hh:mm:ss` format for accurate video citations.
- **Self-Reflective Scoring & Correction Loop**: Evaluates answers on a 1-to-10 scale. If the score is below 7, it extracts missing keywords, refines sub-queries, and retries retrieval (up to 3 times).
- **General Knowledge Fallback**: Seamlessly falls back to general knowledge with a clear disclaimer when the user asks questions outside the indexed video topic.

### 🎨 Surreal Minimalist UI (Frontend)
- **Design Aesthetic**: Warm beige/cream color palette inspired by modern minimalist interfaces.
- **Animations**: Fluid spring transitions and fade-ins powered by [`motion.dev`](https://motion.dev).
- **Simulated Streaming**: Smooth typewriter text effect for AI responses.
- **Multi-Conversation Management**: Slide-in side panel powered by Zustand for chat history, switching, and management.
- **Fully Responsive**: Optimized for desktop and mobile screens.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Animations**: Motion (`motion.dev`)
- **HTTP Client**: Axios
- **Markdown Rendering**: React Markdown

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express.js
- **Vector Database**: Pinecone Database (`@pinecone-database/pinecone` v8+)
- **LLM Engine**: OpenAI API (`gpt-4o-mini`)
- **Subtitle Parser**: `subtitle` library

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Node.js (v18+)
- Bun or npm
- Pinecone API Key & Index
- OpenAI API Key

### 1. Clone & Setup Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=8000
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
```

Run the backend dev server:
```bash
npm run dev
```

### 2. Setup & Run Frontend
```bash
cd frontend
bun install   # or npm install
bun run dev   # or npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🛰️ API Documentation

### `POST /api/generate-response`

**Request Body:**
```json
{
  "query": "How to create an APK file?"
}
```

**Response:**
```json
{
  "result": "To create an APK file, you can follow these steps...\n\n[00:02:15 - 00:02:45]"
}
```

---

## 📦 Deployment Instructions

### Deploying Frontend (Vercel / Render Static Site)
1. Set root directory to `frontend`.
2. Build command: `bun run build` (or `npm run build`).
3. Output directory: `dist`.
4. Environment variable: `VITE_API_URL=https://your-backend-url/api/generate-response`.

### Deploying Backend (Vercel / Render Web Service)
1. Set root directory to `backend`.
2. Build command: `npm install`.
3. Start command: `node src/script.js`.
4. Environment variables: `OPENAI_API_KEY`, `PINECONE_API_KEY`, `PORT=8000`.

---

## 📄 License
ISC
