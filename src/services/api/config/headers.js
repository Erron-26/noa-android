import env from "@utils/env.js";

export const getBaseHeaders = () => ({
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-App-Version": env.APP_VERSION || "1.1.6",
});

export const getAuthHeaders = (token, tenantId = null) => {
    const headers = { Authorization: `Bearer ${token}` };
    if (tenantId) headers["X-Company-UUID"] = tenantId;
    return headers;
};