"""add_description_to_workspaces

Revision ID: 02323a9bafe9
Revises: 054558247b36
Create Date: 2026-06-09 21:22:04.852605

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '02323a9bafe9'
down_revision: Union[str, Sequence[str], None] = '054558247b36'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add missing columns to workspaces table."""
    # Add description column if it doesn't exist
    op.add_column('workspaces', sa.Column('description', sa.String(), nullable=True))
    # Add created_at column if it doesn't exist
    op.add_column('workspaces', sa.Column('created_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    """Remove added columns from workspaces table."""
    op.drop_column('workspaces', 'created_at')
    op.drop_column('workspaces', 'description')

