# ASL Translator - Team Development Guide

This project is a web-based application that uses a webcam and a machine learning model to recognize dynamic American Sign Language (ASL) gestures and translate them into text in real-time.

This README is intended to help our development team get set up and collaborate effectively. A user-facing version will be written later.

---

## Project Overview

We’re building a full-stack application with:

- A React frontend that displays webcam footage and translated text.
- A FastAPI backend that performs model inference and handles authentication.
- A SQLite database to store user data and chat history.

---

## Tech Stack

| Layer     | Tools / Libraries                         |
| --------- | ----------------------------------------- |
| Frontend  | React, React-Webcam, Bootstrap            |
| Backend   | FastAPI (Python), TensorFlow or MediaPipe |
| Database  | SQLite                                    |
| Dev Tools | Docker, Git, GitHub                       |
| Auth      | JSON Web Tokens (JWT)                     |

---

## Folder Structure (Work in Progress)

```

/ASL-translator
├── backend/ # FastAPI app and model logic (Please see branch README for more detail)
├── docker/ # Folder containing additional files for building Dockerfile
├── frontend/ # React app (Vite-based) (Please see branch README for more detail)
├── .dockerignore
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── LICENSE
├── README.md
├── requirements.txt # Backend Python dependencies
└── update_environment.py

```

---

## Getting Started

### 1. Get Access to the Repository

- Send your **GitHub username or email address** to Kareem.
- You'll be added as a collaborator. Accept the invitation via email or GitHub notifications before proceeding.

---

### 2. Clone the Repository

```bash
git clone git@github.com:YOUR-ORG/ASL-translator.git
cd ASL-translator
```

If you're not using SSH, you can clone via HTTPS:

```bash
git clone https://github.com/YOUR-ORG/ASL-translator.git
```

(You may be prompted for your GitHub username and a personal access token.)

---

### (Optional for Development) 3. Install NPM and Python Dependencies

Run install commands to get dependencies for development environment.

```bash
pip install -r requirements
cd frontend
npm install
```

If planning to use a nonstandard endpoint, use update_environment.py to update config options.

```bash
python update_environment.py
```

### 4. Run the Application with Docker

Ensure Docker Desktop is installed and running.

```bash
docker build -t asl-translator:latest .
```

You may optionally update the environment variables BACKEND_URL and
FRONTEND_URL in the docker-compose.yml file if you'd like to use different endpoints

```bash
docker compose up
```

\*\* On first run of docker compose up, the image will be automatically built. If updates are made to the program, please use the following command to update the image.

```bash
docker compose up --build
```

Visit the Frontend at: [http://localhost:5173](http://localhost:5173)

---

## Git Workflow and Pull Requests

Always work on your own branch and use pull requests for collaboration.

**Create a new branch:**

```bash
git checkout -b feature/your-name-description
```

**Commit and push your changes:**

```bash
git add .
git commit -m "Describe your change"
git push origin feature/your-name-description
```

**Open a pull request:**

- Go to the GitHub repo.
- Click "Compare & pull request".
- Add a description, then submit.

Do not push directly to `main`. Use branches and PRs so we can review and merge cleanly.

---

### Frontend Setup Instructions (React + Vite)

Navigate to the frontend folder:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open the app in your browser:
Go to [http://localhost:5173](http://localhost:5173)

---

Reach out in the group chat or tag someone in GitHub if you need help setting things up. Let’s keep the repo clean and organized as we build.
