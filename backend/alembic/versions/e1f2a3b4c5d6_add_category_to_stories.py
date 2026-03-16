"""add category to stories

Revision ID: e1f2a3b4c5d6
Revises: d8e9f0a1b2c3
Create Date: 2026-03-17 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e1f2a3b4c5d6'
down_revision = 'd8e9f0a1b2c3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('stories', sa.Column('category', sa.String(), nullable=True))
    # Backfill: set all existing stories to 'curated'
    op.execute("UPDATE stories SET category = 'curated' WHERE category IS NULL")


def downgrade() -> None:
    op.drop_column('stories', 'category')
