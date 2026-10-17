import { PrismaClient, Prisma } from "@prisma/client";
import { removeResendApiKey } from "@/lib/email/resend-admin";

// Global fix for Decimal serialization in Client Components
// This ensures all Decimal objects are automatically converted to numbers when serialized
if (typeof Prisma.Decimal.prototype.toJSON === "undefined") {
    // @ts-ignore - Override the toJSON method to return number instead of string
    Prisma.Decimal.prototype.toJSON = function () {
        return this.toNumber();
    };
}

// Extend the Decimal prototype to include our custom toJSON method in types
declare module "@prisma/client/runtime/library" {
    interface Decimal {
        toJSON(): number;
    }
}
declare global {
    var prismaGlobal: PrismaClient | undefined;
}

const prismaClient = new PrismaClient();

// When an organization is deleted, remove its Resend API key so we don't leave orphan keys.
prismaClient.$use(async (params, next) => {
    if (params.model === "Organization" && (params.action === "delete" || params.action === "deleteMany")) {
        const orgs = await (prismaClient as PrismaClient).organization.findMany({
            where: params.args.where,
            select: { resendApiKeyId: true },
        });
        for (const org of orgs) {
            if (org.resendApiKeyId) {
                try {
                    await removeResendApiKey(org.resendApiKeyId);
                } catch (err) {
                    console.error(
                        "Failed to remove Resend API key for deleted org:",
                        err,
                    );
                }
            }
        }
    }
    return next(params);
});

export const prisma: PrismaClient = global.prismaGlobal ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
    global.prismaGlobal = prisma;
}
