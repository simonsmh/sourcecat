// Fork: license verification removed. The service ping (which sent deployment
// telemetry to the official Sourcebot license server) is disabled. These
// stubs keep existing callers (e.g. membership.service.ts) working without
// sending anything anywhere.

export const syncWithLighthouse = async (_orgId: number): Promise<void> => {
    return;
};

export const startServicePingCronJob = (): void => {
    return;
};
