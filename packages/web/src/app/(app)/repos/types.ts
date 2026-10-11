import type { WorkloadJob } from "@sourcecat/shared";

export type RepoIndexingStatus = {
    repoId: number;
    indexedAt: string | null;
    indexedCommitHash: string | null;
    latestJob: WorkloadJob<"repo-index"> | null;
};

export type RepoIndexingStatusesResponse = {
    repositories: RepoIndexingStatus[];
};
