from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import assets, workflows, upload

app = FastAPI(
    title="Asset Management API",
    description="API for ITSM Asset Management Module",
    version="1.0.0"
)

# CORS Configuration
origins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3005",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(assets.router)
app.include_router(workflows.router)
app.include_router(upload.router)

@app.get("/")
def root():
    return {"message": "Asset Management API is running"}
