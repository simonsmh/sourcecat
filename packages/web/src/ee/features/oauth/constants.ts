
export const OAUTH_NOT_SUPPORTED_ERROR_MESSAGE = 'OAuth is not supported on this instance. Please authenticate using a Sourcecat API key instead. See https://docs.sourcecat.dev/docs/features/mcp-server for more information.';

export const UNPERMITTED_SCHEMES = /^(javascript|data|vbscript):/i;

export const SOURCECAT_OAUTH_SCOPES = [] as const;
export type SourcecatOAuthScope = (typeof SOURCECAT_OAUTH_SCOPES)[number];
