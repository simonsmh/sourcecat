import { SOURCECAT_VERSION } from "@sourcecat/shared";
import { apiHandler } from "@/lib/apiHandler";
import { GetVersionResponse } from "@/lib/types";

// Note: In Next.JS 14, GET methods with no params are cached by default at build time.
// This creates issues since environment variables (like SOURCECAT_VERSION) are
// not available until runtime. To work around this, we fore the route to be
// dynamic and evaluate on each request.
// @see: https://nextjs.org/docs/14/app/building-your-application/routing/route-handlers#caching
export const dynamic = "force-dynamic";

// eslint-disable-next-line authz/require-auth-wrapper -- public Sourcecat version string, no user data
export const GET = apiHandler(async () => {
    return Response.json({
        version: SOURCECAT_VERSION,
    } satisfies GetVersionResponse);
});