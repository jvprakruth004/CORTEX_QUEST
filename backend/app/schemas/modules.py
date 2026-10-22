"""Module Pydantic schemas for Cortex Quest"""
from typing import List, Optional
from pydantic import BaseModel, Field


class ModuleResponse(BaseModel):
    """Module information for responses"""
    id: int
    slug: str
    name: str
    emoji: str
    description: Optional[str] = None
    display_order: int

    class Config:
        from_attributes = True


class ModulesListResponse(BaseModel):
    """List of modules response"""
    modules: List[ModuleResponse]
    total: int


class SubmoduleResponse(BaseModel):
    """Submodule information for responses"""
    id: int
    slug: str
    name: str
    description: Optional[str] = None
    display_order: int
    is_active: int

    class Config:
        from_attributes = True


class SubmoduleListResponse(BaseModel):
    """List of submodules for a module"""
    module_slug: str
    module_name: str
    submodules: List[SubmoduleResponse]
    total: int