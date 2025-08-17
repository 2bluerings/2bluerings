"""create configurations table

Revision ID: b9336137abf7
Revises: 
Create Date: 2025-06-29 23:14:33.870695

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'b9336137abf7'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # pylint: disable=no-member
    op.create_table(
        'integrations',
        sa.Column('id', sa.Uuid(), nullable=False),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('NOW()'),
            nullable=False
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('NOW()'),
            nullable=False
        ),
        sa.Column(
            'name',
            sa.String(),
            nullable=False
        ),
        sa.Column(
            'config',
            postgresql.JSON(astext_type=sa.Text()),
            nullable=False
        ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_integrations_name'), 'integrations', ['name'], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    """Downgrade schema."""
    # pylint: disable=no-member
    op.drop_index(op.f('ix_integrations_name'), table_name='integrations')
    op.drop_table('integrations')
    # ### end Alembic commands ###
