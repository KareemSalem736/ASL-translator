"""
Create initial config and handle
"""
import os
import configparser

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
