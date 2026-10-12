export const MCP_DOCS_URL = "https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/mcp-server.mdx";

export const MCP_SERVER_SOURCE = 'sourcecat-mcp-server';
export const LEGACY_MCP_SERVER_SOURCE = 'mcp';
export const PRICING_URL = "https://www.sourcecat.dev/pricing";

// Surfaced to MCP clients (and the programmatic blocking endpoint) when the
// instance is on the free plan. MCP clients render the agent-facing error
// text, so keep this human-readable and point at the upgrade path.
export const MCP_PAID_PLAN_REQUIRED_MESSAGE =
    `The Sourcecat MCP server requires a paid subscription. Upgrade your plan at ${PRICING_URL} to enable it.`;
