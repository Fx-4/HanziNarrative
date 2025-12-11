"""add onboarding_completed to users

Revision ID: a1b2c3d4e5f6
Revises: 4eb5d9516696
Create Date: 2025-12-11 02:38:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '4eb5d9516696'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add onboarding_completed column to users table
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false'))


def downgrade() -> None:
    # Remove onboarding_completed column from users table
    op.drop_column('users', 'onboarding_completed')
