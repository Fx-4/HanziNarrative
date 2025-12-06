"""add_ai_usage_table

Revision ID: 6421228aa32f
Revises: f7e5b18d6dc5
Create Date: 2025-12-06 20:23:09.654719

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '6421228aa32f'
down_revision = 'f7e5b18d6dc5'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'ai_usage',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('feature', sa.String(), nullable=False),
        sa.Column('tokens_used', sa.Integer(), nullable=True, server_default='0'),
        sa.Column('timestamp', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('request_data', postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ai_usage_id'), 'ai_usage', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_ai_usage_id'), table_name='ai_usage')
    op.drop_table('ai_usage')
