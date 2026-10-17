import React from "react";
import { prisma } from "@/lib/prisma";
import { CustomerInvoicesTable } from "./table";
import { Invoice } from "@/lib/atoms";

interface CustomerInvoicesProps {
    customerId: string;
}

export async function CustomerInvoices({
    customerId,
}: CustomerInvoicesProps) {
    const invoices = await prisma.invoice.findMany({
        where: {
            customerId,
        },
        include: {
            customer: true,
            items: true,
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <CustomerInvoicesTable
            invoices={JSON.parse(JSON.stringify(invoices)) as Invoice[]}
        />
    );
}
