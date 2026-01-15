from fastapi import APIRouter
from app.routers import upload, workflows, disposal, audit, auth, tickets, asset_requests, assets

api_router = APIRouter()

# routers already define their own prefixes
api_router.include_router(upload.router)
api_router.include_router(workflows.router)
api_router.include_router(disposal.router)
api_router.include_router(audit.router)
api_router.include_router(auth.router)
api_router.include_router(tickets.router)
api_router.include_router(asset_requests.router)
api_router.include_router(assets.router)
