"""add_writing_progress_table

Revision ID: f7e5b18d6dc5
Revises: de7fd2679b00
Create Date: 2025-12-04 09:26:35.505117

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f7e5b18d6dc5'
down_revision = 'de7fd2679b00'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create writing_progress table for tracking character writing practice
    op.create_table(
        'writing_progress',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('word_id', sa.Integer(), sa.ForeignKey('hanzi_words.id'), nullable=False),
        sa.Column('total_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('successful_attempts', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('accuracy_score', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('average_time', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('stroke_accuracy', sa.JSON(), nullable=True),
        sa.Column('mastery_level', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_practiced', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint('user_id', 'word_id', name='unique_user_word_writing')
    )


def downgrade() -> None:
    # Drop writing_progress table
    op.drop_table('writing_progress')
