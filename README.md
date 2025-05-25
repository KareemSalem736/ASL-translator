
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

| Layer       | Tools / Libraries                        |
|-------------|------------------------------------------|
| Frontend    | React, React-Webcam, Bootstrap           |
| Backend     | FastAPI (Python), TensorFlow or MediaPipe|
| Database    | SQLite                                   |
| Dev Tools   | Docker, Git, GitHub                      |
| Auth        | JSON Web Tokens (JWT)                    |

---

## Folder Structure (Work in Progress)

```

/ASL-translator
├── backend/ # FastAPI app and model logic
├── frontend/ # React app (Vite-based)
│ ├── index.html
│ ├── vite.config.js
│ └── src/
├── .dockerignore
├── .gitignore
├── Dockerfile
├── LICENSE
├── README.md
└── requirements.txt # Backend Python dependencies

````

---

## Getting Started

### 1. Get Access to the Repository

- Send your **GitHub username or email address** to Kareem.
- You'll be added as a collaborator. Accept the invitation via email or GitHub notifications before proceeding.

---

### 2. Set Up SSH Access (Recommended)

To securely connect to GitHub and avoid password prompts:

**Generate an SSH key** (only once per machine):

```bash
ssh-keygen -t ed25519 -C "youremail@example.com"
````

* Press Enter to accept the default file location.
* Set a passphrase if desired.

**Add your public key to GitHub:**

```bash
cat ~/.ssh/id_ed25519.pub
```

* Copy the output.
* Go to GitHub → Settings → SSH and GPG Keys → New SSH Key.
* Paste the key and save.

**Test your setup:**

```bash
ssh -T git@github.com
```

If successful, you’ll see a greeting message from GitHub.

---

### 3. Clone the Repository

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

### 4. Run the Backend (FastAPI) with Docker

Ensure Docker Desktop is installed and running.

```bash
docker build -t asl-translator .
docker run -p 8000:8000 asl-translator
```

Visit: `http://localhost:8000`

---

### 5. Run the Frontend (React)

We’re running the frontend locally during development.

```bash
cd frontend
npm install
npm run dev
```

Visit: `http://localhost:5173`

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

* Go to the GitHub repo.
* Click "Compare & pull request".
* Add a description, then submit.

Do not push directly to `main`. Use branches and PRs so we can review and merge cleanly.

---

### Frontend Setup Instructions (React + Vite)
Navigate to the frontend folder:

cd frontend
Install dependencies:

npm install
Run the development server:

npm run dev
Open the app in your browser:
Go to http://localhost:5173

---

Reach out in the group chat or tag someone in GitHub if you need help setting things up. Let’s keep the repo clean and organized as we build.

```