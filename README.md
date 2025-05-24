
# ASL Translator (Capstone Project)
Welcome to our ASL Translator project! This application aims to interpret American Sign Language (ASL) hand gestures captured via webcam using a machine learning model and display their translated meanings. It combines a React front-end, a Python FastAPI back-end, and a TensorFlow-based gesture recognition model.

## Project Overview
**Tech Stack:**  
- Frontend: React, React-Webcam, Bootstrap CSS  
- Backend: FastAPI, JWT authentication  
- Machine Learning: Python, TensorFlow, MediaPipe  
- Tools: Git, GitHub, Docker, Kaggle API, WSL (Ubuntu)

## Getting Started (For Team Members)
These steps will help you get the project running on your machine. You’ll need WSL (Ubuntu), Python 3, and Git installed.

### 🔐 1. Gain Access to the Repository
1. Create a GitHub account at https://github.com  
2. Send your GitHub username to Kareem  
3. Kareem will add you as a collaborator  
4. Accept the GitHub invitation (via email or GitHub notifications)

### 💾 2. Clone the Repository
```bash
cd ~
git clone https://github.com/KareemSalem736/ASL-translator.git
cd ASL-translator
````

### 3. Set Up the ML Model Environment

```bash
cd model
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Set Up Kaggle API Key

1. Go to [https://www.kaggle.com/account](https://www.kaggle.com/account)
2. Click "Create New API Token" to download `kaggle.json`
3. Move it to the correct location:

```bash
mkdir -p ~/.kaggle
mv ~/Downloads/kaggle.json ~/.kaggle/
chmod 600 ~/.kaggle/kaggle.json
```

### 5. Download Dataset

```bash
python scripts/download_data.py
```

### 6. Train the Model

```bash
python scripts/train.py
```

## Project Structure

```
ASL-translator/
├── model/
│   ├── data/               # Training data (ignored by Git)
│   ├── models/             # Trained model files
│   ├── notebooks/          # Prototyping (optional)
│   ├── scripts/            # Training, preprocessing scripts
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # ML environment container (optional)
├── README.md               # You are here!
├── .gitignore              # Prevents unnecessary files from being tracked
└── (frontend/, backend/)   # Will be added later
```

## Making Contributions (Git & GitHub Workflow)

### A. Pull the Latest Changes

```bash
git checkout main
git pull origin main
```

### B. Create a New Branch

```bash
git checkout -b your-feature-name
```

### C. Make and Commit Your Changes

```bash
git add .
git commit -m "Add: Description of your changes"
```

###  D. Push Your Branch to GitHub

```bash
git push origin your-feature-name
```

### E. Open a Pull Request (PR)

1. Visit the repo on GitHub
2. Click "Compare & pull request"
3. Fill in the title and description
4. Assign a reviewer

>  Do not merge your own PR

### F. After Merge

```bash
git checkout main
git pull origin main
```

## 📬 Questions?

If you're stuck or unsure:

* Leave a comment on your PR for clarification
    Or hit the Discord
  We’re all learning!

Let’s build something awesome!!

