"""add_quiz_results_table

Revision ID: 36f7bcaf8615
Revises: fee061750d25
Create Date: 2025-12-10 14:19:15.273744

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '36f7bcaf8615'
down_revision = 'fee061750d25'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table('quiz_results',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('user_id', sa.Integer(), nullable=False),
    sa.Column('quiz_type', sa.String(), nullable=False),
    sa.Column('hsk_level', sa.Integer(), nullable=False),
    sa.Column('score', sa.Integer(), nullable=False),
    sa.Column('total_questions', sa.Integer(), nullable=False),
    sa.Column('percentage', sa.Float(), nullable=False),
    sa.Column('time_spent', sa.Integer(), nullable=True),
    sa.Column('answers', sa.JSON(), nullable=True),
    sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quiz_results_id'), 'quiz_results', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_quiz_results_id'), table_name='quiz_results')
    op.drop_table('quiz_results')
