"""
This module creates a simple command that can be run to automatically
update configs for the frontend and backend.
"""
import configparser
import os.path
import sys
from pathlib import Path
import yarl
from dotenv import set_key


frontend_url = {
    'scheme': 'http',
    'host': 'localhost',
    'port': '5173',
    'path': "/"
}

backend_url = {
    'scheme': 'http',
    'host': 'localhost',
    'port': '8000',
    'path': "/api"
}


def build_url(dictionary_url):
    """
    Create url string from dictionary definitions.

    Parameters:
        dictionary_url (dict): url dictionary to build string from.

    Returns:
        str: String representation of url dictionary.
    """

    return f"{dictionary_url['scheme']}://{dictionary_url['host']}:{dictionary_url['port']}{dictionary_url['path']}"


def update_backend_config():
    config = configparser.ConfigParser()

    if not os.path.isfile("./backend/config.ini"):
        config['CORS'] = {
            'allow_origins': [build_url(frontend_url)],
            'allow_credentials': True,
            'allow_methods': ['*'],
            'allow_headers': ['*']
        }
    else:
        config.read("./backend/config.ini")
        config['CORS'] = {
            'allow_origins': [build_url(frontend_url)],
            'allow_credentials': config.get('CORS', 'allow_credentials'),
            'allow_methods': config.get('CORS', 'allow_methods'),
            'allow_headers': config.get('CORS', 'allow_headers')
        }

    config['HOST'] = {
        'scheme': backend_url['scheme'],
        'host': backend_url['host'],
        'port': backend_url['port'],
        'path': backend_url['path']
    }

    with open('./backend/config.ini', 'w') as configfile:
        config.write(configfile)


def update_frontend_config():
    # Get path to frontend environment file and set frontend and backend urls
    env = Path("./frontend/.env.local")
    env.touch(exist_ok=True)

    set_key(env, "VITE_ALLOWED_HOSTS", frontend_url['host'] + ",localhost")
    set_key(env, "VITE_API_URL", build_url(backend_url))
    set_key(env, "VITE_FRONTEND_URL", build_url(frontend_url))


def setup_environment(frontend_url_string=None, backend_url_string=None):
    """
    Set up the development from one single command.

    Parameters:
        frontend_url_string (str): Option string for frontend url to skip user input.
        backend_url_string (str): Option string for backend url to skip user input.
    """

    # Check if frontend_url_string was set and prompt user for inputs if not
    if frontend_url_string is None:
        print("Enter the frontend url (default: http://localhost:5173):", end="")
        frontend_url_string = str(input())

        if frontend_url_string == "":
            frontend_url_string = "http://localhost:5173"

    url = yarl.URL(frontend_url_string)
    frontend_url['scheme'] = url.scheme
    frontend_url['host'] = url.host
    frontend_url['port'] = str(url.port)
    frontend_url['path'] = url.path

    print(f"Final frontend url: {build_url(frontend_url)}")

    # Check if backend_url_string was set and prompt user for inputs if not
    if backend_url_string is None:
        print("Enter the backend url (default: http://localhost:8000/api):", end="")
        backend_url_string = str(input())

        if backend_url_string == "":
            backend_url_string = "http://localhost:8000/api"

    url = yarl.URL(backend_url_string)
    backend_url['scheme'] = url.scheme
    backend_url['host'] = url.host
    backend_url['port'] = str(url.port)
    backend_url['path'] = url.path

    print(f"Final backend url: {build_url(backend_url)}")

    update_frontend_config()
    update_backend_config()


if __name__ == '__main__':
    # Determine if command arguments have been passed to automate setup.
    if len(sys.argv) == 3:
        setup_environment(sys.argv[1], sys.argv[2])
    else:
        setup_environment()
