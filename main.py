"""
PathForge — AI Personalized Learning Path Generator
FastAPI Backend  |  main.py
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from database import engine, Base
from routers import auth, users, learning_path, quiz, mentor, analytics, resources, gamification


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create all tables on startup."""
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="PathForge API",
    description="AI Personalized Learning Path Generator — Backend",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:5500", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── ROUTERS ──────────────────────────────────────────────────────
app.include_router(auth.router,          prefix="/api/auth",         tags=["Auth"])
app.include_router(users.router,         prefix="/api/users",        tags=["Users"])
app.include_router(learning_path.router, prefix="/api/learning",     tags=["Learning Path"])
app.include_router(quiz.router,          prefix="/api/quiz",         tags=["Quiz"])
app.include_router(mentor.router,        prefix="/api/mentor",       tags=["AI Mentor"])
app.include_router(analytics.router,     prefix="/api/analytics",    tags=["Analytics"])
app.include_router(resources.router,     prefix="/api/resources",    tags=["Resources"])
app.include_router(gamification.router,  prefix="/api/gamification", tags=["Gamification"])


@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "PathForge API is running 🚀"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "healthy"}