# Use a base image
FROM python:3.11-slim

RUN apt-get update && apt-get install -y supervisor

RUN mkdir -p /var/log/supervisor
RUN mkdir -p /usr/asl-translator

# Set the working directory
WORKDIR /usr/asl-translator

# Copy the current directory contents into the container
COPY frontend ./frontend
COPY backend ./backend
COPY requirements.txt ./
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Install dependencies (adjust if you have a requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000
EXPOSE 5000

# Set the default command
CMD ["/usr/bin/supervisord"]