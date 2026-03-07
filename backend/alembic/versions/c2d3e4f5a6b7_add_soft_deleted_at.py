"""add soft_deleted_at to users and stories

Revision ID: c2d3e4f5a6b7
Revises: b1c2d3e4f5a6
Create Date: 2026-03-05 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

revision = 'c2d3e4f5a6b7'
down_revision = 'b1c2d3e4f5a6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('soft_deleted_at', sa.DateTime(timezone=True), nullable=True))
    op.add_column('stories', sa.Column('soft_deleted_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'soft_deleted_at')
    op.drop_column('stories', 'soft_deleted_at')
