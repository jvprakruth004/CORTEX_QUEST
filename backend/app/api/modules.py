"""Modules API router for Cortex Quest"""
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.content import Module, Submodule
from app.schemas.modules import ModuleResponse, ModulesListResponse, SubmoduleResponse, SubmoduleListResponse

router = APIRouter(prefix="/modules", tags=["modules"])


@router.get("", response_model=ModulesListResponse)
async def list_modules(
    db: Session = Depends(get_db),
):
    """
    List all active modules ordered by display_order.
    """
    modules = (
        db.query(Module)
        .filter(Module.is_active == 1)
        .order_by(Module.display_order)
        .all()
    )

    module_responses = [
        ModuleResponse(
            id=m.id,
            slug=m.slug,
            name=m.name,
            emoji=m.emoji,
            description=m.description,
            display_order=m.display_order,
        )
        for m in modules
    ]

    return ModulesListResponse(
        modules=module_responses,
        total=len(module_responses),
    )


@router.get("/{slug}", response_model=ModuleResponse)
async def get_module(
    slug: str,
    db: Session = Depends(get_db),
):
    """
    Get details for a single active module by slug.
    """
    module = (
        db.query(Module)
        .filter(Module.slug == slug, Module.is_active == 1)
        .first()
    )

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    return ModuleResponse(
        id=module.id,
        slug=module.slug,
        name=module.name,
        emoji=module.emoji,
        description=module.description,
        display_order=module.display_order,
    )


@router.get("/{module_slug}/submodules", response_model=SubmoduleListResponse)
async def list_submodules(
    module_slug: str,
    db: Session = Depends(get_db),
):
    """
    List all active submodules for a given module, ordered by display_order.
    """
    # Validate parent module exists and is active
    module = (
        db.query(Module)
        .filter(Module.slug == module_slug, Module.is_active == 1)
        .first()
    )

    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    submodules = (
        db.query(Submodule)
        .filter(
            Submodule.module_id == module.id,
            Submodule.is_active == 1,
            Submodule.slug != "no-submodule",  # Exclude dummy submodule for legacy progress
        )
        .order_by(Submodule.display_order)
        .all()
    )

    submodule_responses = [
        SubmoduleResponse(
            id=s.id,
            slug=s.slug,
            name=s.name,
            description=s.description,
            display_order=s.display_order,
            is_active=s.is_active,
        )
        for s in submodules
    ]

    return SubmoduleListResponse(
        module_slug=module.slug,
        module_name=module.name,
        submodules=submodule_responses,
        total=len(submodule_responses),
    )