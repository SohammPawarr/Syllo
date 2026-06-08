"""
Syllo AI Backend — FastAPI Application

Endpoints:
  POST /v1/process    → Queue a document for ingestion (extract → chunk → embed)
  POST /v1/generate   → Generate a quiz from a processed document via RAG + Gemini
  GET  /v1/status/{id}→ Check Celery task status
  GET  /health        → Health check
"""

# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from config import settings

app = FastAPI(
    title="Syllo AI Engine",
    version="1.0.0",
    description="Backend service for document processing and AI quiz generation",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------


class ProcessRequest(BaseModel):
    document_id: str
    file_url: str


class GenerateRequest(BaseModel):
    document_id: str
    topic: str
    difficulty: str = Field(default="Intermediate", pattern="^(Beginner|Intermediate|Advanced)$")
    question_count: int = Field(default=5, ge=1, le=20)


class ProcessResponse(BaseModel):
    status: str
    task_id: str


class GenerateResponse(BaseModel):
    status: str
    quiz: dict


class TaskStatusResponse(BaseModel):
    task_id: str
    state: str
    phase: str | None = None
    result: dict | None = None
    error: str | None = None


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    document_id: str
    messages: list[ChatMessage]


class ChatResponse(BaseModel):
    status: str
    reply: str


class GenerateImageRequest(BaseModel):
    document_id: str
    topic: str


class GenerateImageResponse(BaseModel):
    status: str
    image_url: str


class GenerateFlashcardsRequest(BaseModel):
    document_id: str
    topic: str
    count: int = Field(default=10, ge=1, le=50)


class GenerateFlashcardsResponse(BaseModel):
    status: str
    flashcards: dict


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "syllo-ai-engine"}


@app.post("/v1/process", response_model=ProcessResponse)
async def process_document(request: ProcessRequest):
    """Queue a document for the full ingestion pipeline."""
    from celery_worker import process_document_task

    task = process_document_task.delay(request.document_id, request.file_url)
    return ProcessResponse(status="queued", task_id=task.id)


@app.get("/v1/status/{task_id}", response_model=TaskStatusResponse)
async def get_task_status(task_id: str):
    """Poll the status of a Celery task."""
    from celery_worker import celery_app

    result = celery_app.AsyncResult(task_id)

    phase = None
    error = None
    task_result = None

    if result.state == "PROGRESS":
        meta = result.info or {}
        phase = meta.get("phase")
    elif result.state == "SUCCESS":
        task_result = result.result
    elif result.state == "FAILURE":
        error = str(result.info)

    return TaskStatusResponse(
        task_id=task_id,
        state=result.state,
        phase=phase,
        result=task_result,
        error=error,
    )


@app.post("/v1/generate", response_model=GenerateResponse)
async def generate_quiz(request: GenerateRequest):
    """
    Generate a quiz by:
      1. Retrieving the most relevant chunks via RAG
      2. Sending the context to Gemini for quiz generation
    """
    from services.rag_service import retrieve_relevant_chunks
    from services.quiz_service import generate_quiz as gen_quiz
    from database import save_quiz

    try:
        # Step 1: RAG retrieval
        context = retrieve_relevant_chunks(
            document_id=request.document_id,
            query=request.topic,
            top_k=10,
        )

        # Step 2: Gemini generation
        quiz_data = gen_quiz(
            context=context,
            topic=request.topic,
            difficulty=request.difficulty,
            question_count=request.question_count,
        )

        # Step 3: Persist to MongoDB
        quiz_record = {
            "documentId": request.document_id,
            "topic": request.topic,
            "difficulty": request.difficulty,
            "questionCount": request.question_count,
            "result": quiz_data,
        }
        quiz_id = save_quiz(quiz_record)
        quiz_data["quiz_id"] = quiz_id

        return GenerateResponse(status="success", quiz=quiz_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/generate-flashcards", response_model=GenerateFlashcardsResponse)
async def generate_flashcards_route(request: GenerateFlashcardsRequest):
    """
    Generate flashcards from the document chunks.
    """
    from services.rag_service import retrieve_relevant_chunks
    from services.flashcard_service import generate_flashcards

    try:
        # Step 1: RAG retrieval
        context = retrieve_relevant_chunks(
            document_id=request.document_id,
            query=request.topic,
            top_k=10,
        )

        # Step 2: Gemini generation
        flashcards_data = generate_flashcards(
            context=context,
            topic=request.topic,
            count=request.count,
        )

        return GenerateFlashcardsResponse(status="success", flashcards=flashcards_data)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/chat", response_model=ChatResponse)
async def chat_route(request: ChatRequest):
    """
    Chat with the document using RAG.
    """
    from services.rag_service import retrieve_relevant_chunks
    from services.chat_service import generate_chat_response

    try:
        if not request.messages:
            raise ValueError("Messages list cannot be empty")

        current_query = request.messages[-1].content
        
        # Step 1: RAG retrieval
        context = retrieve_relevant_chunks(
            document_id=request.document_id,
            query=current_query,
            top_k=10,
        )

        # Step 2: Gemini generation
        messages_dict = [{"role": m.role, "content": m.content} for m in request.messages]
        reply = generate_chat_response(
            context=context,
            messages=messages_dict,
        )

        return ChatResponse(status="success", reply=reply)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/v1/generate-image", response_model=GenerateImageResponse)
async def generate_image_route(request: GenerateImageRequest):
    """
    Generate an image URL based on document topic.
    """
    from services.rag_service import retrieve_relevant_chunks
    from services.image_service import generate_image_url

    try:
        # Step 1: RAG retrieval
        context = retrieve_relevant_chunks(
            document_id=request.document_id,
            query=request.topic,
            top_k=10,
        )

        # Step 2: Gemini prompt generation + Pollinations URL
        image_url = generate_image_url(
            context=context,
            topic=request.topic,
        )

        return GenerateImageResponse(status="success", image_url=image_url)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Run with: uvicorn main:app --reload --port 7860
# ---------------------------------------------------------------------------
