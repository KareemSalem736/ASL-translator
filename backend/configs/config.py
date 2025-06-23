"""
Create initial config and handle
"""
import os
import configparser

from secrets import token_hex

config = configparser.ConfigParser()


def initialize_config():
    """
    Initialize default config data if file does not exist or load data from file.
    """
    if not os.path.exists('config.ini'):
        config['HOST'] = {
            'scheme': 'http',
            'host': 'localhost',
            'port': '8000',
            'path': '/api'
        }

        config['AUTH'] = {
            "secret_access": token_hex(32),
            "secret_refresh": token_hex(32),
            "algorithm": "HS256",
            "access_token_expire_minutes": 15,
            "refresh_token_expire_days": 30
        }

        config['CORS'] = {
            'allow_origins': ['http://localhost:5173'],
            'allow_credentials': True,
            'allow_methods': ['*'],
            'allow_headers': ['*']
        }

        with open('config.ini', 'w') as configfile:
            config.write(configfile)
    else:
        config.read('config.ini')


def get_config():
    """
    Return instance of config
    """
    return config


initialize_config()