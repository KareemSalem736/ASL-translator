"""
This file is currently a work in progress.
"""


def create_tables(conn):
    cursor = conn.cursor()

    cursor.executescript("""
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        email TEXT,
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS datasets (
        id INTEGER PRIMARY KEY,
        name TEXT,
        source_url TEXT,
        description TEXT,
        license TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ml_models (
        id INTEGER PRIMARY KEY,
        name TEXT,
        version TEXT,
        description TEXT,
        accuracy FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        dataset_id INTEGER NOT NULL,
        FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    );

    CREATE TABLE IF NOT EXISTS prediction_history (
        id INTEGER PRIMARY KEY,
        user_id INTEGER NOT NULL,
        content TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        model_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (model_id) REFERENCES ml_models(id)
    );

    CREATE TABLE IF NOT EXISTS input_files (
        id INTEGER PRIMARY KEY,
        prediction_id INTEGER NOT NULL,
        file_path TEXT,
        file_type TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (prediction_id) REFERENCES prediction_history(id)
    );
    """)
    conn.commit()
