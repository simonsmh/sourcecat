// Fork: the changelog feed (fetched from the official Sourcebot server) is
// disabled. These stubs keep existing callers working without fetching
// anything.

export const pollChangelog = async (): Promise<void> => {
    return;
};

export const startChangelogPollingJob = (): void => {
    return;
};
