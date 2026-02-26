"""add_content_pinyin_to_stories

Revision ID: 11bd916caad6
Revises: 6c0aff8935e8
Create Date: 2025-12-12 09:46:06.372929

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '11bd916caad6'
down_revision = '6c0aff8935e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add content_pinyin column to stories table
    op.add_column('stories', sa.Column('content_pinyin', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove content_pinyin column from stories table
    op.drop_column('stories', 'content_pinyin')
