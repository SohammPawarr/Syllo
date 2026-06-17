# Syllo 🤖

**Build a Better Study Habit. Upload, analyze, and master your documents effortlessly.** Syllo empowers you to extract insights, generate interactive study materials, and maximize your learning potential using state-of-the-art AI.

Syllo is a comprehensive Next.js web application designed to supercharge your study sessions, streamline document analysis, and foster active learning through AI-driven insights, mind maps, quizzes, and audio summaries.

## ✨ Key Features
- **Smart Document Processing:** Seamlessly upload PDFs or import directly from Google Drive and Google Classroom.
- **Interactive AI Chat:** Engage in real-time conversations with your documents. Ask questions, clarify concepts, and get instant, context-aware answers.
- **Dynamic Study Tools:** Instantly generate Flashcards, interactive Quizzes, and comprehensive PDF Reports from your study materials.
- **Visual Mind Maps:** Automatically construct interactive, node-based mind maps (powered by React Flow) to visualize complex topics and relationships.
- **Audio Summaries (TTS):** Convert dense document summaries into high-quality audio files so you can learn on the go.
- **Gamified Credit System:** Built-in daily credit management (10,000 pts/day) to track and optimize your AI usage.
- **Custom Design System:** A beautifully crafted UI utilizing modern neo-brutalism aesthetics, dynamic Tailwind styling, and buttery-smooth Framer Motion animations.

## 🧠 AI & Backend Architecture
Syllo leverages a robust Python backend to process data quickly and efficiently:

- **Groq Integration:** Utilizes ultra-fast LPU inference via the Groq API for lightning-fast natural language processing and document Q&A.
- **Local Embeddings:** Uses `fastembed` and `langchain-text-splitters` for efficient document chunking and vectorization.
- **Asynchronous Task Queue:** Powered by **Celery** and **Redis**, ensuring heavy AI processing (like generating full reports or audio files) happens smoothly in the background without blocking the UI.
- **gTTS (Google Text-to-Speech):** Synthesizes natural-sounding voice summaries directly from generated study notes.
- **fpdf2:** Dynamically compiles generated insights into perfectly formatted PDF reports.

## 📁 Directory Structure
```text
syllo/
├── ai-backend/              # Python FastAPI & Celery backend
│   ├── background.py        # Celery task definitions (AI generation)
│   ├── celery_worker.py     # Celery app initialization
│   ├── main.py              # FastAPI application & REST endpoints
│   ├── database.py          # MongoDB connection handlers
│   ├── outputs/             # Generated audio and PDF artifacts
│   └── requirements.txt     # Python dependencies
├── app/                     # Next.js 16 App Router
│   ├── api/                 # Next.js API Routes (Auth, Credits, Triggers)
│   ├── dashboard/           # Main application workspace layout
│   └── globals.css          # Global Tailwind and custom design variables
├── components/              # Reusable React UI Components
│   ├── ChatInterface.tsx    # Real-time document chat UI
│   ├── FileUpload.tsx       # Drag-and-drop & Google Drive integration
│   ├── CustomMindMap.tsx    # React Flow interactive diagram renderer
│   ├── FlashcardViewer.tsx  # Flippable flashcard study interface
│   └── GenerateForm.tsx     # Tools menu and credit cost indicators
├── public/                  # Static assets and icons
├── .env.local               # Frontend environment variables
└── package.json             # Node dependencies and scripts
```

## 🛠️ Tech Stack
- **Frontend Framework:** Next.js 16 (React 19)
- **Styling & Animation:** Tailwind CSS v4, Framer Motion
- **Diagramming:** `@xyflow/react` (React Flow), Dagre (auto-layout)
- **Authentication:** NextAuth.js (Google OAuth)
- **Backend Framework:** FastAPI (Python)
- **Task Queue:** Celery, Redis
- **Database:** MongoDB (`mongoose`, `pymongo`)
- **AI / NLP:** Groq API, FastEmbed, LangChain

## 🚀 Getting Started

### Prerequisites
- Install **Node.js** (v20+)
- Install **Python** (3.10+)
- Install and run **Redis Server** (required for Celery)
- Setup a **MongoDB** cluster (or run locally)
- Get a **Groq API Key** and **Google OAuth Credentials**

### Environment Setup
1. **Frontend (`.env.local`)**:
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key
MONGODB_URI=your_mongodb_connection_string
```

2. **Backend (`ai-backend/.env`)**:
```env
GROQ_API_KEY=your_groq_api_key
REDIS_URL=redis://localhost:6379/0
MONGO_URI=your_mongodb_connection_string
```

### Running the App

**1. Start the Python Backend & Worker:**
```powershell
cd ai-backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt

# Start FastAPI server (Terminal 1)
uvicorn main:app --reload --port 7860

# Start Celery worker (Terminal 2)
celery -A celery_worker.celery_app worker --loglevel=info --pool=solo
```

**2. Start the Next.js Frontend:**
```powershell
# Open a new terminal at the root directory
npm install
npm run dev
```

The application will be running at `http://localhost:3000`.

### Building for Release
To build the frontend for production deployment (e.g., on Vercel):
```powershell
npm run build
npm run start
```
*Note: The Python backend should be deployed separately to a service like Render, Heroku, or an AWS EC2 instance, ensuring Redis is available in the production environment.*
