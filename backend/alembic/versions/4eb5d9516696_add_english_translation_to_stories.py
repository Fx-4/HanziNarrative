"""add english_translation to stories

Revision ID: 4eb5d9516696
Revises: fcca51d376c3
Create Date: 2025-12-04 06:56:44.735990

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4eb5d9516696'
down_revision = 'fcca51d376c3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add english_translation column to stories table
    op.add_column('stories', sa.Column('english_translation', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove english_translation column from stories table
    op.drop_column('stories', 'english_translation')
