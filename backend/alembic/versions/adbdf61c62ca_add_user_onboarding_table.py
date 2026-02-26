"""add_user_onboarding_table

Revision ID: adbdf61c62ca
Revises: 36f7bcaf8615
Create Date: 2025-12-11 09:54:25.500903

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'adbdf61c62ca'
down_revision = '36f7bcaf8615'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('user_onboarding',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('onboarding_completed', sa.Boolean(), nullable=True, server_default='false'),
    sa.Column('current_step', sa.Integer(), nullable=True, server_default='0'),
    sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
    sa.Column('took_assessment', sa.Boolean(), nullable=True, server_default='false'),
    sa.Column('assessment_score', sa.Float(), nullable=True),
    sa.Column('assessment_questions_answered', sa.Integer(), nullable=True, server_default='0'),
    sa.Column('assessment_correct_answers', sa.Integer(), nullable=True, server_default='0'),
    sa.Column('determined_hsk_level', sa.Integer(), nullable=True, server_default='1'),
    sa.Column('goals', sa.JSON(), nullable=True),
    sa.Column('preferences', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('user_id', name='unique_user_onboarding')
    )
    op.create_index(op.f('ix_user_onboarding_id'), 'user_onboarding', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_user_onboarding_id'), table_name='user_onboarding')
    op.drop_table('user_onboarding')
