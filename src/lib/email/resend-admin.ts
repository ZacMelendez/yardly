/**
 * Resend admin API: create/delete API keys using RESEND_ADMIN_KEY.
 * Used to provision per-organization sending keys.
 */

async function getAdminResend() {
    const apiKey = process.env.RESEND_ADMIN_KEY;
    if (!apiKey) {
        throw new Error(
            "RESEND_ADMIN_KEY is not set. Required to create org API keys.",
        );
    }
    const { Resend } = await import("resend");
    return new Resend(apiKey);
}

export interface CreateOrgApiKeyResult {
    id: string;
    token: string;
}

/**
 * Create a Resend API key with sending_access for an organization.
 * Name is truncated to 50 chars (Resend limit).
 */
export async function createOrgApiKey(
    name: string,
): Promise<CreateOrgApiKeyResult> {
    const resend = await getAdminResend();
    const keyName = name.length > 50 ? name.slice(0, 47) + "..." : name;
    const { data, error } = await resend.apiKeys.create({
        name: keyName,
        permission: "sending_access",
    });
    if (error) {
        throw new Error(error.message);
    }
    if (!data?.id || !data?.token) {
        throw new Error("Resend did not return API key id/token");
    }
    return { id: data.id, token: data.token };
}

/**
 * Delete a Resend API key by id (e.g. when an org is removed).
 */
export async function removeResendApiKey(apiKeyId: string): Promise<void> {
    const resend = await getAdminResend();
    const { error } = await resend.apiKeys.remove(apiKeyId);
    if (error) {
        throw new Error(error.message);
    }
}
