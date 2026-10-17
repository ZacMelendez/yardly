import React from "react";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { customSession, organization } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { getUserSubscription } from "@/lib/subscription";
import { sendEmail } from "@/lib/email/resend";
import OrganizationInviteEmail from "@/emails/OrganizationInviteEmail";

const baseURL =
    process.env.BETTER_AUTH_URL ??
    (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

export const auth = betterAuth({
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"),
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        organization({
            async sendInvitationEmail(data) {
                const inviteLink = `${baseURL}/invite/${data.id}`;
                const inviterName =
                    (data.inviter as { user?: { name?: string; email?: string } })
                        ?.user?.name ??
                    (data.inviter as { user?: { email?: string } })?.user
                        ?.email ??
                    "A team member";
                const organizationName =
                    (data.organization as { name?: string })?.name ?? "the team";
                const organizationId = (data.organization as { id?: string })?.id;
                await sendEmail({
                    to: data.email,
                    subject: `You've been invited to join ${organizationName}`,
                    organizationId: organizationId ?? undefined,
                    react: React.createElement(OrganizationInviteEmail, {
                        inviterName,
                        organizationName,
                        inviteLink,
                        recipientEmail: data.email,
                    }),
                });
            },
        }),
        customSession(async ({ user, session }) => {
            if (!user?.id) return { user, session };
            const subscription = await getUserSubscription(user.id);
            return {
                user: {
                    ...user,
                    subscription: {
                        planId: subscription.planId,
                        planName: subscription.planName,
                        status: subscription.status,
                        features: subscription.features,
                    },
                },
                session,
            };
        }),
    ],
});

// Extended session type including subscription from customSession plugin
export type Session = Omit<typeof auth.$Infer.Session, "user"> & {
    user: typeof auth.$Infer.Session["user"] & {
        subscription?: {
            planId: string;
            planName: string;
            status: string;
            features: string[];
        };
    };
};
