#!/bin/sh
python update_environment.py ${FRONTEND_URL} ${BACKEND_URL}
/usr/bin/supervisord