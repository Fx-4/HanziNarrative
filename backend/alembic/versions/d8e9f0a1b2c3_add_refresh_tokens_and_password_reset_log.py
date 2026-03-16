"""add refresh_tokens and password_reset_request_logs

Revision ID: d8e9f0a1b2c3
Revises: c2d3e4f5a6b7
Create Date: 2026-03-16 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd8e9f0a1b2c3'
down_revision = 'c2d3e4f5a6b7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── refresh_tokens ────────────────────────────────────────────────────────
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('token', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('replaced_by_token', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_refresh_tokens_id'), 'refresh_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_refresh_tokens_token'), 'refresh_tokens', ['token'], unique=True)
    op.create_index(op.f('ix_refresh_tokens_user_id'), 'refresh_tokens', ['user_id'], unique=False)

    # ── password_reset_request_logs ───────────────────────────────────────────
    op.create_table(
        'password_reset_request_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_password_reset_request_logs_id'), 'password_reset_request_logs', ['id'], unique=False)
    op.create_index(op.f('ix_password_reset_request_logs_email'), 'password_reset_request_logs', ['email'], unique=False)
    op.create_index(op.f('ix_password_reset_request_logs_requested_at'), 'password_reset_request_logs', ['requested_at'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_password_reset_request_logs_requested_at'), table_name='password_reset_request_logs')
    op.drop_index(op.f('ix_password_reset_request_logs_email'), table_name='password_reset_request_logs')
    op.drop_index(op.f('ix_password_reset_request_logs_id'), table_name='password_reset_request_logs')
    op.drop_table('password_reset_request_logs')

    op.drop_index(op.f('ix_refresh_tokens_user_id'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_token'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_id'), table_name='refresh_tokens')
    op.drop_table('refresh_tokens')
