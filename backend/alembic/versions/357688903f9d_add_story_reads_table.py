"""add story_reads table

Revision ID: 357688903f9d
Revises: 4f4e29a86896
Create Date: 2026-07-27 11:37:35.188461

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '357688903f9d'
down_revision = '4f4e29a86896'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # NOTE: autogenerate also emitted index/constraint changes for `ai_usage` and
    # `user_progress` (idx_ai_usage_*, idx_user_progress_*, uq_user_progress_user_word).
    # Those are unrelated to this migration and were removed — in particular the
    # unique constraint would fail outright if any duplicate rows exist in production.
    # This migration only adds the story_reads table.
    op.create_table('story_reads',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('story_id', sa.Integer(), nullable=False),
    sa.Column('xp_awarded', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['story_id'], ['stories.id'], ),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', 'story_id', name='uq_story_reads_user_story')
    )
    op.create_index(op.f('ix_story_reads_id'), 'story_reads', ['id'], unique=False)
    op.create_index(op.f('ix_story_reads_story_id'), 'story_reads', ['story_id'], unique=False)
    op.create_index(op.f('ix_story_reads_user_id'), 'story_reads', ['user_id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_story_reads_user_id'), table_name='story_reads')
    op.drop_index(op.f('ix_story_reads_story_id'), table_name='story_reads')
    op.drop_index(op.f('ix_story_reads_id'), table_name='story_reads')
    op.drop_table('story_reads')
