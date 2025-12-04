"""fix_user_progress_add_missing_fields

Revision ID: de7fd2679b00
Revises: 4eb5d9516696
Create Date: 2025-12-04 09:25:12.178815

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'de7fd2679b00'
down_revision = '4eb5d9516696'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add missing fields required by learning_service.py SM-2 algorithm
    op.add_column('user_progress', sa.Column('mastery_level', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user_progress', sa.Column('correct_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user_progress', sa.Column('incorrect_count', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user_progress', sa.Column('easiness_factor', sa.Float(), nullable=False, server_default='2.5'))
    op.add_column('user_progress', sa.Column('interval', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('user_progress', sa.Column('repetitions', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('user_progress', sa.Column('next_review', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    # Remove columns added in upgrade
    op.drop_column('user_progress', 'next_review')
    op.drop_column('user_progress', 'repetitions')
    op.drop_column('user_progress', 'interval')
    op.drop_column('user_progress', 'easiness_factor')
    op.drop_column('user_progress', 'incorrect_count')
    op.drop_column('user_progress', 'correct_count')
    op.drop_column('user_progress', 'mastery_level')
