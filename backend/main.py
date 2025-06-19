"""
Main file for running FastAPI backend. Declares standard
predict endpoint and basic settings for backend.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import uvicorn
import backend.configs.config as config

from backend.routers import predict

app = FastAPI()

config.initialize_config()

prefix = config.get_config().get('HOST', 'path')

app.include_router(predict.router, prefix=prefix)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.get_config().get('CORS', 'allow_origins'),
    allow_credentials=config.get_config().get('CORS', 'allow_credentials'),
    allow_methods=config.get_config().get('CORS', 'allow_methods'),
    allow_headers=config.get_config().get('CORS', 'allow_headers'),
)


if __name__ == "__main__":
    uvicorn.run(app, host='0.0.0.0', port=int(config.get_config().get('HOST', 'port')))
