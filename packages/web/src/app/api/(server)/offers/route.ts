import { apiHandler } from "@/lib/apiHandler";

// Fork: license verification removed. Pricing offers are no longer fetched
// from the license server; return an empty offers response.

// eslint-disable-next-line authz/require-auth-wrapper -- this endpoint is intended to not require auth.
export const GET = apiHandler(async () => {
    return new Response(JSON.stringify({
        pricing: {
            monthly: { unitAmount: 0, currency: "usd" },
            annual: { unitAmount: 0, currency: "usd" },
        },
        trial: { durationDays: 0, eligible: false, creditCardRequired: false },
    }), {
        headers: {
            'Cache-Control': 'public, max-age=300'
        }
    });
})
