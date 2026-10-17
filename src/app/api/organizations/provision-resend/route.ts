import { NextRequest, NextResponse } from "next/server";
import { getUserId } from "@/app/api/utils";
import { assertMemberOfOrganization } from "@/app/api/utils";
import { prisma } from "@/lib/prisma";
import { createOrgApiKey } from "@/lib/email/resend-admin";

export const dynamic = "force-dynamic";

/**
 * Provision a Resend API key for an organization (idempotent).
 * Call after creating an org so that org can send emails under its own name.
 */
export async function POST(req: NextRequest) {
    let userId: string;
    try {
        userId = await getUserId();
    } catch {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: { organizationId?: string };
    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 },
        );
    }

    const organizationId = body.organizationId?.trim();
    if (!organizationId) {
        return NextResponse.json(
            { error: "organizationId is required" },
            { status: 400 },
        );
    }

    try {
        await assertMemberOfOrganization(organizationId, userId);
    } catch {
        return NextResponse.json(
            { error: "Forbidden: not a member of this organization" },
            { status: 403 },
        );
    }

    const org = await prisma.organization.findUnique({
        where: { id: organizationId },
        select: {
            id: true,
            name: true,
            resendApiKeyId: true,
            resendApiKey: true,
        },
    });

    if (!org) {
        return NextResponse.json(
            { error: "Organization not found" },
            { status: 404 },
        );
    }

    if (org.resendApiKeyId && org.resendApiKey) {
        return NextResponse.json({ success: true, alreadyProvisioned: true });
    }

    try {
        const { id, token } = await createOrgApiKey(org.name);
        await prisma.organization.update({
            where: { id: organizationId },
            data: { resendApiKeyId: id, resendApiKey: token },
        });
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error("Failed to provision Resend key for org:", err);
        return NextResponse.json(
            {
                error:
                    err instanceof Error
                        ? err.message
                        : "Failed to provision email key",
            },
            { status: 500 },
        );
    }
}
