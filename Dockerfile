# Use a base image
FROM python:3.11-slim

# Set the working directory
WORKDIR /app

# Copy the current directory contents into the container
COPY . .

# Install dependencies (adjust if you have a requirements.txt)
RUN pip install --no-cache-dir -r requirements.txt

# Set the default command
CMD ["python", "main.py"]
