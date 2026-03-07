"""add is_admin to users

Revision ID: b1c2d3e4f5a6
Revises: a7b3e3d1fcbb
Create Date: 2026-03-05 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b1c2d3e4f5a6'
down_revision = 'a7b3e3d1fcbb'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    op.drop_column('users', 'is_admin')
