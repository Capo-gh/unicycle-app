"""convert_images_to_json

Revision ID: 8d523054edcb
Revises: c4d67bda132c
Create Date: 2026-02-28 23:24:15.047352

"""
import json
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '8d523054edcb'
down_revision: Union[str, Sequence[str], None] = 'c4d67bda132c'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Convert listings.images from comma-separated strings to JSON arrays."""
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, images FROM listings WHERE images IS NOT NULL")).fetchall()
    for row in rows:
        images_val = row[1]
        if images_val and not images_val.strip().startswith('['):
            parts = [p.strip() for p in images_val.split(',') if p.strip()]
            conn.execute(
                text("UPDATE listings SET images = :v WHERE id = :id"),
                {"v": json.dumps(parts), "id": row[0]}
            )


def downgrade() -> None:
    """Convert listings.images back from JSON arrays to comma-separated strings."""
    conn = op.get_bind()
    rows = conn.execute(text("SELECT id, images FROM listings WHERE images IS NOT NULL")).fetchall()
    for row in rows:
        images_val = row[1]
        if images_val and images_val.strip().startswith('['):
            try:
                parts = json.loads(images_val)
                conn.execute(
                    text("UPDATE listings SET images = :v WHERE id = :id"),
                    {"v": ','.join(parts), "id": row[0]}
                )
            except (json.JSONDecodeError, TypeError):
                pass
