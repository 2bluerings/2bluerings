# 2 Blue Rings (Backend)

This project is built with **FastAPI**, **Postgres + pgvector**, and **Alembic**.  
Dependency management and virtual environments are handled with **Poetry**.

## 🛠️ Getting Started & Instalation

```bash
# Clone the repo
git clone https://github.com/2bluerings/2bluerings
cd backend

# Add the following env vars
# Update urls with your own credentials and ensure postgres is running with pgvector
# extension enabled.
export DATABASE_URL="postgresql+psycopg2://postgres:password@localhost:5433/db"
export DATABASE_URL_CHECKPOINTER="postgresql://postgres:password@localhost:5433/db"

# Make sure poetry and pyenv is setup with python 3.10.17

# Setup python 3.10.17
pyenv install 3.10.17
pyenv local 3.10.17

# Instal dependencies & activate env
poetry install
source .venv/bin/activate

# Run all migrations, ensure database is created and is reachable
alembic upgrade head

# Run fastapi server
fastapi dev src/main.py
