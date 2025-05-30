# start_server.py
import subprocess
import time

# Start the frontend HTTP server with logging output to console
frontend = subprocess.Popen(
    ["python", "-m", "http.server", "5500"],
    cwd="frontend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

# Wait briefly to ensure the frontend server starts
time.sleep(1)

# Start the FastAPI backend server (uvicorn) with logging output to console
backend = subprocess.Popen(
    ["uvicorn", "main:app", "--reload", "--host", "0.0.0.0"],
    cwd="backend",
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True
)

try:
    print("Both servers are running. Press Ctrl+C to stop.\n")

    # Print logs from both processes in real time
    while True:
        frontend_output = frontend.stdout.readline()
        if frontend_output:
            print(f"[FRONTEND] {frontend_output.strip()}")

        backend_output = backend.stdout.readline()
        if backend_output:
            print(f"[BACKEND] {backend_output.strip()}")

        # Break if either process ends
        if frontend.poll() is not None and backend.poll() is not None:
            break

except KeyboardInterrupt:
    print("\nShutting down servers...")
    frontend.terminate()
    backend.terminate()
