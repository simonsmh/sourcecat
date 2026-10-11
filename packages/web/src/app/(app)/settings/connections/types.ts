import type { WorkloadJob } from "@sourcecat/shared";

export type ConnectionSyncStatus = {
    connectionId: number;
    syncedAt: string | null;
    latestJob: WorkloadJob<"connection-sync"> | null;
};

export type ConnectionSyncStatusesResponse = {
    connections: ConnectionSyncStatus[];
};
