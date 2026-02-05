from common import get_settings
from sqlmodel import Session, SQLModel, create_engine

settings = get_settings()
engine = create_engine(settings.database_url, echo=False)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    init_db()
    with Session(engine) as session:
        yield session
