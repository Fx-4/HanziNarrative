"""add_profile_fields_to_users

Revision ID: 3a7a3a449d10
Revises: adbdf61c62ca
Create Date: 2025-12-11 14:38:38.744905

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '3a7a3a449d10'
down_revision = 'adbdf61c62ca'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add full_name and profile_picture columns to users table
    op.add_column('users', sa.Column('full_name', sa.String(), nullable=True))
    op.add_column('users', sa.Column('profile_picture', sa.String(), nullable=True))


def downgrade() -> None:
    # Remove the columns if rolling back
    op.drop_column('users', 'profile_picture')
    op.drop_column('users', 'full_name')
