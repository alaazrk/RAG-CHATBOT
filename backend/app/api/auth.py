import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests

router = APIRouter(prefix="/auth", tags=["Auth"])

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


class GoogleAuthRequest(BaseModel):
    credential: str  # le "id_token" JWT renvoyé par Google côté frontend


@router.post("/google")
def google_login(request: GoogleAuthRequest):
    if not GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID manquant côté serveur.")

    try:
        payload = google_id_token.verify_oauth2_token(
            request.credential,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(status_code=401, detail="Token Google invalide.")

    return {
        "email": payload.get("email"),
        "name": payload.get("name"),
        "picture": payload.get("picture"),
    }