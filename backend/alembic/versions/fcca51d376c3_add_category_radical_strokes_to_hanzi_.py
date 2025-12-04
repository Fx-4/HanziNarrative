"""add_category_radical_strokes_to_hanzi_words

Revision ID: fcca51d376c3
Revises: 904e8634d3d4
Create Date: 2025-12-03 22:23:31.777165

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'fcca51d376c3'
down_revision = '904e8634d3d4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to hanzi_words table
    op.add_column('hanzi_words', sa.Column('category', sa.String(), nullable=True))
    op.add_column('hanzi_words', sa.Column('radical', sa.String(), nullable=True))
    op.add_column('hanzi_words', sa.Column('strokes', sa.Integer(), nullable=True))

    # Create indexes for better query performance
    op.create_index(op.f('ix_hanzi_words_category'), 'hanzi_words', ['category'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_hanzi_words_category'), table_name='hanzi_words')

    # Drop columns
    op.drop_column('hanzi_words', 'strokes')
    op.drop_column('hanzi_words', 'radical')
    op.drop_column('hanzi_words', 'category')
