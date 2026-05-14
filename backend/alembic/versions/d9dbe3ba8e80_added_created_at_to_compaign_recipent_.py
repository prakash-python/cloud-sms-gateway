"""added created at to compaign recipent model

Revision ID: d9dbe3ba8e80
Revises: bce3b6c10377
Create Date: 2026-05-14 13:47:13.597881

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd9dbe3ba8e80'
down_revision: Union[str, None] = 'bce3b6c10377'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('campaign_recipients', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True))


def downgrade() -> None:
    op.drop_column('campaign_recipients', 'created_at')
