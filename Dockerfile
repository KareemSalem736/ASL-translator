FROM node:18 AS builder

WORKDIR /frontend-build

COPY frontend ./

RUN npm install

FROM python:3.11-slim

# No install recommends helps cut down on unnecessary package installs.
RUN apt-get update && apt-get install -y supervisor && apt-get install -y npm --no-install-recommends

# Create application directory and log folders.
RUN mkdir -p /app && mkdir -p /var/log/supervisor

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container
COPY backend ./backend
#COPY frontend ./frontend
COPY --from=builder /frontend-build ./frontend
COPY requirements.txt .
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN pip install --no-cache-dir -r requirements.txt

WORKDIR /app/frontend
RUN npm install

EXPOSE 8000
EXPOSE 5173

# Set the default command
CMD ["/usr/bin/supervisord"]