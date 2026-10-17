import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { PAGE, FONTS, COLORS, LINE_HEIGHT } from "./layout";

export interface InvoicePdfData {
    id: string;
    status: string;
    dueDate: string | null;
    createdAt: string;
    customer: {
        name: string;
        email?: string | null;
        phone?: string | null;
        address?: string | null;
    };
    items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
    }>;
    businessName?: string;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

function formatInvoiceNumber(id: string): string {
    return `INV-${id.slice(-8).toUpperCase()}`;
}

export async function generateInvoicePdf(
    data: InvoicePdfData,
): Promise<Uint8Array> {
    const doc = await PDFDocument.create();
    const page = doc.addPage([PAGE.width, PAGE.height]);
    const { width, height, margin } = PAGE;

    const helvetica = await doc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await doc.embedFont(StandardFonts.HelveticaBold);

    let y = height - margin;

    // Header: Business name (or "Yardli")
    const businessName = data.businessName || "Yardli";
    page.drawText(businessName, {
        x: margin,
        y,
        size: FONTS.subtitle,
        font: helveticaBold,
        color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
    });
    y -= FONTS.subtitle * LINE_HEIGHT;

    page.drawText("Invoice", {
        x: margin,
        y,
        size: FONTS.subtitle,
        font: helvetica,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    y -= FONTS.subtitle * LINE_HEIGHT * 1.5;

    // Invoice number and status
    const invoiceNum = formatInvoiceNumber(data.id);
    page.drawText(invoiceNum, {
        x: margin,
        y,
        size: FONTS.title,
        font: helveticaBold,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    y -= FONTS.title * LINE_HEIGHT;

    const statusText = `Status: ${data.status}`;
    const statusWidth = helvetica.widthOfTextAtSize(statusText, FONTS.small);
    page.drawText(statusText, {
        x: width - margin - statusWidth,
        y: y + FONTS.title * 0.3,
        size: FONTS.small,
        font: helvetica,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    y -= FONTS.body * LINE_HEIGHT * 1.5;

    // Divider line
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(COLORS.border.r, COLORS.border.g, COLORS.border.b),
    });
    y -= FONTS.body * LINE_HEIGHT * 1.5;

    // Two columns: Bill To (left) | Dates (right)
    const colWidth = (width - margin * 2) / 2;

    page.drawText("Bill To", {
        x: margin,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    page.drawText(data.customer.name, {
        x: margin,
        y,
        size: FONTS.body,
        font: helvetica,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    if (data.customer.address) {
        page.drawText(data.customer.address, {
            x: margin,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        y -= FONTS.body * LINE_HEIGHT;
    }
    if (data.customer.email) {
        page.drawText(data.customer.email, {
            x: margin,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        y -= FONTS.body * LINE_HEIGHT;
    }
    if (data.customer.phone) {
        page.drawText(data.customer.phone, {
            x: margin,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        y -= FONTS.body * LINE_HEIGHT;
    }

    const billToBottom = y;
    y = height - margin - FONTS.subtitle * LINE_HEIGHT * 4;

    page.drawText("Invoice Date", {
        x: margin + colWidth,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    page.drawText(formatDate(data.createdAt), {
        x: margin + colWidth,
        y,
        size: FONTS.body,
        font: helvetica,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    if (data.dueDate) {
        page.drawText("Due Date", {
            x: margin + colWidth,
            y,
            size: FONTS.small,
            font: helveticaBold,
            color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
        });
        y -= FONTS.body * LINE_HEIGHT;

        page.drawText(formatDate(data.dueDate), {
            x: margin + colWidth,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
    }

    y = Math.min(billToBottom, y) - FONTS.body * LINE_HEIGHT * 1.5;

    // Items table
    const colDesc = margin;
    const colQty = width - margin - 180;
    const colPrice = width - margin - 120;
    const colTotal = width - margin - 60;

    page.drawText("Description", {
        x: colDesc,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    page.drawText("Qty", {
        x: colQty,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    page.drawText("Unit Price", {
        x: colPrice,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    page.drawText("Total", {
        x: colTotal,
        y,
        size: FONTS.small,
        font: helveticaBold,
        color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(COLORS.border.r, COLORS.border.g, COLORS.border.b),
    });
    y -= FONTS.body * LINE_HEIGHT * 0.5;

    let total = 0;
    for (const item of data.items) {
        const itemTotal = item.quantity * Number(item.unitPrice);
        total += itemTotal;

        const maxDescWidth = colQty - colDesc - 10;
        let desc = item.description;
        if (helvetica.widthOfTextAtSize(desc, FONTS.body) > maxDescWidth) {
            while (
                desc.length > 1 &&
                helvetica.widthOfTextAtSize(desc + "...", FONTS.body) >
                    maxDescWidth
            ) {
                desc = desc.slice(0, -1);
            }
            desc = desc + "...";
        }

        page.drawText(desc, {
            x: colDesc,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        page.drawText(String(item.quantity), {
            x: colQty,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        page.drawText(formatCurrency(Number(item.unitPrice)), {
            x: colPrice,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        page.drawText(formatCurrency(itemTotal), {
            x: colTotal,
            y,
            size: FONTS.body,
            font: helvetica,
            color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
        });
        y -= FONTS.body * LINE_HEIGHT;
    }

    y -= FONTS.body * LINE_HEIGHT * 0.5;
    page.drawLine({
        start: { x: margin, y },
        end: { x: width - margin, y },
        thickness: 0.5,
        color: rgb(COLORS.border.r, COLORS.border.g, COLORS.border.b),
    });
    y -= FONTS.body * LINE_HEIGHT;

    page.drawText("Total Due", {
        x: colTotal - 60,
        y,
        size: FONTS.body,
        font: helveticaBold,
        color: rgb(COLORS.text.r, COLORS.text.g, COLORS.text.b),
    });
    page.drawText(formatCurrency(total), {
        x: colTotal,
        y,
        size: FONTS.body,
        font: helveticaBold,
        color: rgb(COLORS.primary.r, COLORS.primary.g, COLORS.primary.b),
    });

    const footerY = margin;
    page.drawText(
        `Generated by Yardli • ${formatDate(new Date().toISOString())}`,
        {
            x: margin,
            y: footerY,
            size: FONTS.small,
            font: helvetica,
            color: rgb(COLORS.muted.r, COLORS.muted.g, COLORS.muted.b),
        },
    );

    return doc.save();
}
