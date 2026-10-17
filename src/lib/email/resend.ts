import type { ReactElement } from "react";
import { prisma } from "@/lib/prisma";

const DEFAULT_FROM_EMAIL =
    process.env.RESEND_FROM_EMAIL ?? "Yardli <onboarding@resend.dev>";

function getResendClient(apiKey: string) {
    return import("resend").then(({ Resend }) => new Resend(apiKey));
}

/** Parse "Display Name <email@domain.com>" to extract email or return as-is if no angle brackets. */
function parseFromEmail(from: string): { name?: string; email: string } {
    const match = from.match(/^(.*?)\s*<([^>]+)>$/);
    if (match) {
        const name = match[1].trim() || undefined;
        const email = match[2].trim();
        return { name, email };
    }
    return { email: from.trim() };
}

/**
 * Get Resend client and "from" address for the given organization (if any).
 * When organizationId is set and the org has a Resend key, use that key and org name as from.
 * Otherwise use RESEND_API_KEY and RESEND_FROM_EMAIL.
 */
async function getResendAndFrom(organizationId?: string | null): Promise<{
    resend: Awaited<ReturnType<typeof getResendClient>>;
    from: string;
}> {
    if (organizationId) {
        const org = await prisma.organization.findUnique({
            where: { id: organizationId },
            select: { name: true, resendApiKey: true },
        });
        if (org?.resendApiKey) {
            const parsed = parseFromEmail(DEFAULT_FROM_EMAIL);
            const from = `${org.name} <${parsed.email}>`;
            const resend = await getResendClient(org.resendApiKey);
            return { resend, from };
        }
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
        throw new Error(
            "RESEND_API_KEY is not set. Add it to your .env to send emails (or provision Resend for the organization).",
        );
    }
    const resend = await getResendClient(apiKey);
    return { resend, from: DEFAULT_FROM_EMAIL };
}

export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    react: ReactElement;
    attachments?: Array<{
        content: string; // base64-encoded
        filename: string;
    }>;
    /** When set, use this org's Resend API key and org name as sender. */
    organizationId?: string | null;
}

export async function sendEmail({
    to,
    subject,
    react,
    attachments,
    organizationId,
}: SendEmailOptions) {
    const { resend } = await getResendAndFrom(organizationId);
    const { data, error } = await resend.emails.send({
        from: "quotes@yardli.app",
        to: Array.isArray(to) ? to : [to],
        subject,
        react,
        attachments,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
