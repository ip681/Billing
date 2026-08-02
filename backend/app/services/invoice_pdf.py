import io
import os

from PIL import Image as PILImage
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle
from reportlab.lib.styles import ParagraphStyle

from app.models.invoice import Invoice

LOGO_MAX_WIDTH = 4 * cm
LOGO_MAX_HEIGHT = 2.2 * cm

_FONT_CANDIDATES = [
    ("Invoice", r"C:\Windows\Fonts\arial.ttf"),
    ("Invoice-Bold", r"C:\Windows\Fonts\arialbd.ttf"),
    ("Invoice", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),
    ("Invoice-Bold", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"),
]

_fonts_registered = False


def _ensure_fonts() -> None:
    global _fonts_registered
    if _fonts_registered:
        return
    found = {name: path for name, path in _FONT_CANDIDATES if os.path.exists(path)}
    if "Invoice" not in found:
        raise RuntimeError(
            "No Unicode (Cyrillic-capable) TTF font found for PDF generation. "
            "Install a font such as DejaVu Sans and add its path to _FONT_CANDIDATES."
        )
    pdfmetrics.registerFont(TTFont("Invoice", found["Invoice"]))
    pdfmetrics.registerFont(TTFont("Invoice-Bold", found.get("Invoice-Bold", found["Invoice"])))
    _fonts_registered = True


def _build_logo_image(logo_path: str) -> Image:
    with PILImage.open(logo_path) as img:
        width_px, height_px = img.size
    aspect = width_px / height_px
    width, height = LOGO_MAX_WIDTH, LOGO_MAX_WIDTH / aspect
    if height > LOGO_MAX_HEIGHT:
        height = LOGO_MAX_HEIGHT
        width = LOGO_MAX_HEIGHT * aspect
    return Image(logo_path, width=width, height=height)


def build_invoice_pdf(invoice: Invoice, logo_path: str | None = None) -> bytes:
    _ensure_fonts()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=2 * cm,
        bottomMargin=2 * cm,
        leftMargin=2 * cm,
        rightMargin=2 * cm,
    )

    title_style = ParagraphStyle("Title", fontName="Invoice-Bold", fontSize=18, spaceAfter=12)
    normal_style = ParagraphStyle("Normal", fontName="Invoice", fontSize=10, leading=14)
    bold_style = ParagraphStyle("Bold", fontName="Invoice-Bold", fontSize=10, leading=14)

    elements = []

    title_block = [
        Paragraph(f"Фактура № {invoice.invoice_number}", title_style),
        Paragraph(f"Дата на издаване: {invoice.issue_date.isoformat()}", normal_style),
    ]

    if logo_path and os.path.exists(logo_path):
        header_table = Table(
            [[_build_logo_image(logo_path), title_block]],
            colWidths=[LOGO_MAX_WIDTH + 0.5 * cm, None],
        )
        header_table.setStyle(
            TableStyle(
                [
                    ("VALIGN", (0, 0), (-1, -1), "TOP"),
                    ("ALIGN", (0, 0), (0, 0), "LEFT"),
                ]
            )
        )
        elements.append(header_table)
    else:
        elements.extend(title_block)

    elements.append(Spacer(1, 12))

    party_data = [
        [Paragraph("Доставчик", bold_style), Paragraph("Получател", bold_style)],
        [
            Paragraph(
                f"{invoice.company_name}<br/>ЕИК: {invoice.company_eik}<br/>{invoice.company_address}",
                normal_style,
            ),
            Paragraph(
                f"{invoice.counterparty_name}<br/>ЕИК: {invoice.counterparty_eik}"
                + (f"<br/>ДДС №: {invoice.counterparty_vat_number}" if invoice.counterparty_vat_number else "")
                + f"<br/>{invoice.counterparty_address}",
                normal_style,
            ),
        ],
    ]
    party_table = Table(party_data, colWidths=[8.5 * cm, 8.5 * cm])
    party_table.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 6),
            ]
        )
    )
    elements.append(party_table)
    elements.append(Spacer(1, 18))

    items_header = ["Продукт/услуга", "Кол.", "Ед. цена", "ДДС %", "Сума"]
    items_rows = [items_header]
    for item in invoice.items:
        items_rows.append(
            [
                f"{item.product_name} ({item.product_unit})",
                str(item.quantity),
                str(item.product_unit_price),
                str(item.product_vat_rate) if item.product_vat_rate is not None else "—",
                str(item.line_total),
            ]
        )

    items_table = Table(items_rows, colWidths=[7 * cm, 2 * cm, 2.5 * cm, 2 * cm, 3.5 * cm])
    items_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Invoice"),
                ("FONTNAME", (0, 0), (-1, 0), "Invoice-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 9),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("BACKGROUND", (0, 0), (-1, 0), colors.whitesmoke),
                ("ALIGN", (1, 0), (-1, -1), "RIGHT"),
            ]
        )
    )
    elements.append(items_table)
    elements.append(Spacer(1, 12))

    if not invoice.company_is_vat_registered and invoice.company_vat_exempt_reason:
        elements.append(Paragraph(invoice.company_vat_exempt_reason, normal_style))
        elements.append(Spacer(1, 12))

    totals_data = [
        ["Данъчна основа:", f"{invoice.subtotal} лв."],
        ["ДДС:", f"{invoice.vat_amount} лв."],
        ["Общо:", f"{invoice.total} лв."],
    ]
    totals_table = Table(totals_data, colWidths=[13 * cm, 3.5 * cm])
    totals_table.setStyle(
        TableStyle(
            [
                ("FONTNAME", (0, 0), (-1, -1), "Invoice"),
                ("FONTNAME", (0, 2), (-1, 2), "Invoice-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 10),
                ("ALIGN", (1, 0), (1, -1), "RIGHT"),
            ]
        )
    )
    elements.append(totals_table)

    doc.build(elements)
    return buffer.getvalue()
