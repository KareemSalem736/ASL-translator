FROM node:18 AS builder

WORKDIR /frontend-build

COPY frontend ./

RUN npm install

FROM python:3.11-slim

ENV BACKEND_URL=http://localhost:8000/api
ENV FRONTEND_URL=http://localhost:5173

# No install recommends helps cut down on unnecessary package installs.
RUN apt-get update && apt-get install -y supervisor && apt-get install -y npm --no-install-recommends

# Create application directory and log folders.
RUN mkdir -p /app && mkdir -p /var/log/supervisor

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container
COPY backend ./backend
COPY --from=builder /frontend-build ./frontend
COPY docker/requirements.txt .
COPY update_environment.py .
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY --chmod=755 docker/entrypoint.sh .

RUN pip install --no-cache-dir --extra-index-url https://download.pytorch.org/whl/cpu -r requirements.txt

WORKDIR /app/frontend
RUN npm install

EXPOSE 8000
EXPOSE 5173

WORKDIR /app

# Set the default command
ENTRYPOINT ["/app/entrypoint.sh"]