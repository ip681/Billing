"""hotfix: drop legacy global invoice_number unique constraint and invoice_number_prefix

Revision ID: a907ea434c20
Revises: d3708a703dac
Create Date: 2026-08-02 15:10:51.522055

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a907ea434c20'
down_revision: Union[str, Sequence[str], None] = 'd3708a703dac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        # Legacy constraint predates multi-tenancy: invoice_number was globally
        # unique before company_id existed. uq_invoice_company_number (added in
        # d3708a703dac) is the correct scope; this old one blocks two different
        # companies from both having e.g. invoice_number "1".
        op.execute("ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_invoice_number_key")
        op.drop_column("companies", "invoice_number_prefix")
    else:
        # SQLite: best-effort, since local dev DBs are disposable and the
        # inline unique=True from the original migration isn't always
        # reflected under a stable constraint name.
        try:
            with op.batch_alter_table("invoices") as batch_op:
                batch_op.drop_constraint("invoices_invoice_number_key", type_="unique")
        except Exception:
            pass
        with op.batch_alter_table("companies") as batch_op:
            batch_op.drop_column("invoice_number_prefix")


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if bind.dialect.name == "postgresql":
        op.add_column("companies", sa.Column("invoice_number_prefix", sa.String(), nullable=True))
        op.execute("ALTER TABLE invoices ADD CONSTRAINT invoices_invoice_number_key UNIQUE (invoice_number)")
    else:
        with op.batch_alter_table("companies") as batch_op:
            batch_op.add_column(sa.Column("invoice_number_prefix", sa.String(), nullable=True))
