"""add_story_bookmarks

Revision ID: 6c0aff8935e8
Revises: 3a7a3a449d10
Create Date: 2025-12-11 15:41:58.837449

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6c0aff8935e8'
down_revision = '3a7a3a449d10'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create story_bookmarks association table
    op.create_table(
        'story_bookmarks',
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), primary_key=True),
        sa.Column('story_id', sa.Integer(), sa.ForeignKey('stories.id'), primary_key=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now())
    )


def downgrade() -> None:
    op.drop_table('story_bookmarks')
