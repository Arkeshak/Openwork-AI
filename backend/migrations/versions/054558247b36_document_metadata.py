"""document metadata

Revision ID: 054558247b36
Revises: 55953798339d
Create Date: 2026-06-07 10:53:16.099760
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "054558247b36"
down_revision: Union[str, Sequence[str], None] = "55953798339d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "documents",
        sa.Column(
            "file_size",
            sa.Integer(),
            nullable=True
        )
    )

    op.add_column(
        "documents",
        sa.Column(
            "content_type",
            sa.String(),
            nullable=True
        )
    )

    op.add_column(
        "documents",
        sa.Column(
            "created_at",
            sa.DateTime(),
            nullable=True
        )
    )


def downgrade() -> None:

    op.drop_column(
        "documents",
        "created_at"
    )

    op.drop_column(
        "documents",
        "content_type"
    )

    op.drop_column(
        "documents",
        "file_size"
    )
