import React from "react";
import { notFound } from "next/navigation";
import { Container, Stack } from "@mantine/core";
import { getUserIdOrOrgId, buildScopeWhere } from "../../api/utils";
import { prisma } from "@/lib/prisma";
import InvoiceDetail from "./components/InvoiceDetail";

export default async function InvoicePage(props: {
    params: Promise<{ id: string }>;
}) {
    const params = await props.params;
    const scope = await getUserIdOrOrgId();
    const scopeWhere = buildScopeWhere(scope);

    const invoice = await prisma.invoice.findFirst({
        where: { id: params.id, ...scopeWhere },
        include: {
            customer: true,
            items: { include: { service: true } },
            job: { select: { id: true, title: true, date: true } },
            organization: { select: { name: true } },
        },
    });

    if (!invoice) {
        return notFound();
    }

    const serialized = JSON.parse(JSON.stringify(invoice));

    return (
        <Container size="lg" py="md">
            <Stack gap="lg">
                <InvoiceDetail invoice={serialized} />
            </Stack>
        </Container>
    );
}
