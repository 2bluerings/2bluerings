from fastapi import APIRouter
from .v1.router import router as v1_router

# pylint: disable=unused-import
from .v1 import (
    integrations,
    llms,
    messages,
    projects,
    context_nodes,
    threads,
    users
)

router = APIRouter(
    prefix="/api"
)
router.include_router(v1_router)
