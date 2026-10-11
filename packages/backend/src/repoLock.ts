export const REPOSITORY_EXECUTION_LOCK = {
    resource: ({ repoId }: { repoId: number }) =>
        `sourcecat:lock:repo:${repoId}`,
    durationMs: 60_000,
};
