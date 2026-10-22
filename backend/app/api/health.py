from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "ok",
        "service": "cortex-quest-api",
        "version": "1.0.0"
    }


@router.get("/health/db")
async def health_db(db: Session = Depends(get_db)):
    """Database connectivity health check."""
    try:
        # Test database connection
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            return {
                "status": "ok",
                "database": "connected",
                "message": "PostgreSQL connection successful"
            }
        else:
            raise HTTPException(status_code=503, detail="Database query returned unexpected result")
    except Exception:
        # Don't expose internal error details
        raise HTTPException(status_code=503, detail="Database connection failed")