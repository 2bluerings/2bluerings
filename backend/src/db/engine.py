import os
from sqlmodel import create_engine

engine = create_engine(
    os.getenv("DATABASE_URL"),
    pool_size=20,
    echo=True,
)
