import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function getUserId() {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");
    return session.user.id;
}

export interface UserIdOrOrgId {
    userId: string;
    organizationId: string | null;
}

/**
 * Returns the effective scope for data access.
 * All data (customers, estimates, jobs, invoices, services) is company-scoped.
 * Requires an active organization to be selected.
 */
export async function getUserIdOrOrgId(): Promise<UserIdOrOrgId> {
    const session = await getSession();
    if (!session?.user?.id) throw new Error("Unauthorized");

    const activeOrganizationId =
        (session.session as { activeOrganizationId?: string | null })
            ?.activeOrganizationId ?? null;

    if (!activeOrganizationId) {
        throw new Error(
            "No organization selected. Please select or create a company to continue."
        );
    }

    await assertMemberOfOrganization(activeOrganizationId, session.user.id);

    return {
        userId: session.user.id,
        organizationId: activeOrganizationId,
    };
}

/**
 * Returns the required organization ID for the current session.
 * Throws if no organization is selected.
 */
export async function getRequiredOrganizationId(): Promise<string> {
    const scope = await getUserIdOrOrgId();
    if (!scope.organizationId) {
        throw new Error(
            "No organization selected. Please select or create a company to continue."
        );
    }
    return scope.organizationId;
}

/**
 * Build Prisma where clause for company-scoped data access.
 * All entities are scoped by organizationId.
 */
export function buildScopeWhere(
    scope: UserIdOrOrgId
): { organizationId: string } {
    if (!scope.organizationId) {
        throw new Error(
            "No organization selected. Please select or create a company to continue."
        );
    }
    return { organizationId: scope.organizationId };
}

/**
 * Verifies the user is a member of the organization. Throws if not.
 */
export async function assertMemberOfOrganization(
    organizationId: string,
    userId: string
): Promise<void> {
    const member = await prisma.member.findUnique({
        where: {
            organizationId_userId: { organizationId, userId },
        },
    });
    if (!member) {
        throw new Error("Forbidden: Not a member of this organization");
    }
}
