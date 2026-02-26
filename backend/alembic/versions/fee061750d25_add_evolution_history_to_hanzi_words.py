"""add_evolution_history_to_hanzi_words

Revision ID: fee061750d25
Revises: f91b868d63cf
Create Date: 2025-12-08 10:56:50.642602

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fee061750d25'
down_revision = 'f91b868d63cf'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add evolution_history column to hanzi_words table
    op.add_column('hanzi_words', sa.Column('evolution_history', sa.Text(), nullable=True))


def downgrade() -> None:
    # Remove evolution_history column from hanzi_words table
    op.drop_column('hanzi_words', 'evolution_history')
