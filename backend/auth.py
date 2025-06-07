"""
This file is currently a work in progress.
"""

from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
#from app.users import verify_user, create_access_token

router = APIRouter()


#@router.post("/token")
#def login(form_data: OAuth2PasswordRequestForm = Depends()):
#    user = verify_user(form_data.username, form_data.password)
#    if not user:
#        raise HTTPException(status_code=400, detail="Invalid username or password")
#    token = create_access_token({"sub": user["username"]})
#    return {"access_token": token, "token_type": "bearer"}
