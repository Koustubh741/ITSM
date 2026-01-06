from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ExitRequestResponse(BaseModel):
    id: str
    user_id: str
    status: str
    assets_snapshot: Optional[List[Dict[str, Any]]] = None
    byod_snapshot: Optional[List[Dict[str, Any]]] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True