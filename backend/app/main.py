from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.api import health, auth, modules, quiz, store

settings = get_settings()

app = FastAPI(
    title="Cortex Quest API",
    description="Gamified Learning and Aptitude Training Platform",
    version="1.0.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api", tags=["authentication"])
app.include_router(modules.router, prefix="/api", tags=["modules"])
app.include_router(quiz.router, prefix="/api", tags=["quiz"])
app.include_router(store.router, prefix="/api", tags=["store"])


@app.get("/")
async def root():
    return {
        "message": "Cortex Quest API",
        "version": "1.0.0",
        "docs": "/docs"
    }