"""
Main file for running FastAPI backend. Declares standard
predict endpoint and basic settings for backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import uvicorn

from backend.configs.config import get_config

from backend.routers import predict, auth, account

app = FastAPI()

prefix = get_config().get('HOST', 'path')

app.include_router(predict.router, prefix=prefix)
app.include_router(auth.router, prefix=prefix)
app.include_router(account.router, prefix=prefix)

app.add_middleware(
    CORSMiddleware,
    allow_origins=get_config().get('CORS', 'allow_origins'),
    allow_credentials=get_config().get('CORS', 'allow_credentials'),
    allow_methods=get_config().get('CORS', 'allow_methods'),
    allow_headers=get_config().get('CORS', 'allow_headers'),
)


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(get_config().get('HOST', 'port')))
