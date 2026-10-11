import { OrgRole, type License } from "@sourcecat/db";
import {
    type OfflineLicenseMetadata,
} from "@sourcecat/shared";
import { compareVersions, formatVersion, parseVersion } from "@sourcecat/shared/client";
import { BannerPriority, type BannerDescriptor, type BannerId } from "./types";
import { PermissionSyncBanner } from "./permissionSyncBanner";
import { UpgradeAvailableBanner } from "./upgradeAvailableBanner";
import { RepositorySyncIssuesBanner } from "./repositorySyncIssuesBanner";
import { RepositoryFirstSyncBanner } from "./repositoryFirstSyncBanner";
import { ConnectionSyncIssuesBanner } from "./connectionSyncIssuesBanner";
import { ConnectionFirstSyncBanner } from "./connectionFirstSyncBanner";
import type { PermissionSyncStatusResponse } from "@/app/api/(server)/ee/permissionSyncStatus/api";

export interface BannerContext {
    role: OrgRole | null;
    license: License | null;
    offlineLicense: OfflineLicenseMetadata | null;
    hasPermissionSyncEntitlement: boolean;
    hasPendingFirstSync: boolean;
    permissionSyncIssues: PermissionSyncStatusResponse['issues'];
    connectionSyncCounts: {
        firstTimeSyncingCount: number;
        failedCount: number;
        warningCount: number;
    };
    repositorySyncCounts: {
        firstTimeSyncingCount: number;
        failedCount: number;
        warningCount: number;
    };
    dismissals: Partial<Record<BannerId, string>>;
    today: string;
    now: Date;
    currentVersion: string;
    // null when the GitHub-tags fetch was skipped or failed.
    latestVersion: string | null;
}

export function resolveActiveBanner(ctx: BannerContext): BannerDescriptor | null {
    const candidates = buildCandidates(ctx)
        .filter((b) => b.audience === 'everyone' || ctx.role === OrgRole.OWNER)
        .filter((b) => !(b.dismissible && ctx.dismissals[b.id] === ctx.today));

    candidates.sort((a, b) => b.priority - a.priority);
    return candidates[0] ?? null;
}

function buildCandidates(ctx: BannerContext): BannerDescriptor[] {
    const banners: BannerDescriptor[] = [];

    // Fork: license verification removed. License expiry banners never appear.

    // Fork: license verification removed. The license rebound / trial /
    // past-due banners are deleted; the license is always valid.

    // Fork: license verification removed. Service ping is disabled; the
    // ping staleness banner never appears.

    if (
        ctx.hasPermissionSyncEntitlement &&
        (ctx.hasPendingFirstSync || ctx.permissionSyncIssues.length > 0)
    ) {
        banners.push({
            id: 'permissionSync',
            priority: BannerPriority.PERMISSION_SYNC,
            dismissible: false,
            audience: 'everyone',
            render: (props) => (
                <PermissionSyncBanner
                    {...props}
                    initialStatus={{
                        hasPendingFirstSync: ctx.hasPendingFirstSync,
                        issues: ctx.permissionSyncIssues,
                    }}
                />
            ),
        });
    }

    if (ctx.connectionSyncCounts.failedCount > 0) {
        banners.push({
            id: 'connectionSyncFailed',
            priority: BannerPriority.CONNECTION_SYNC_FAILED,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <ConnectionSyncIssuesBanner
                    {...props}
                    count={ctx.connectionSyncCounts.failedCount}
                    status="failed"
                />
            ),
        });
    }
    if (ctx.connectionSyncCounts.warningCount > 0) {
        banners.push({
            id: 'connectionSyncWarning',
            priority: BannerPriority.CONNECTION_SYNC_WARNING,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <ConnectionSyncIssuesBanner
                    {...props}
                    count={ctx.connectionSyncCounts.warningCount}
                    status="warning"
                />
            ),
        });
    }
    if (ctx.connectionSyncCounts.firstTimeSyncingCount > 0) {
        banners.push({
            id: 'connectionFirstSync',
            priority: BannerPriority.CONNECTION_FIRST_SYNC,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <ConnectionFirstSyncBanner
                    {...props}
                    initialCounts={ctx.connectionSyncCounts}
                />
            ),
        });
    }

    const {
        firstTimeSyncingCount: repositoryFirstTimeSyncingCount,
        failedCount: repositorySyncFailedCount,
        warningCount: repositorySyncWarningCount,
    } = ctx.repositorySyncCounts;
    if (repositorySyncFailedCount > 0) {
        banners.push({
            id: 'repositorySyncFailed',
            priority: BannerPriority.REPOSITORY_SYNC_FAILED,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <RepositorySyncIssuesBanner
                    {...props}
                    failedCount={repositorySyncFailedCount}
                    warningCount={repositorySyncWarningCount}
                />
            ),
        });
    } else if (repositorySyncWarningCount > 0) {
        banners.push({
            id: 'repositorySyncWarning',
            priority: BannerPriority.REPOSITORY_SYNC_WARNING,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <RepositorySyncIssuesBanner
                    {...props}
                    failedCount={repositorySyncFailedCount}
                    warningCount={repositorySyncWarningCount}
                />
            ),
        });
    }
    if (repositoryFirstTimeSyncingCount > 0) {
        banners.push({
            id: 'repositoryFirstSync',
            priority: BannerPriority.REPOSITORY_FIRST_SYNC,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <RepositoryFirstSyncBanner
                    {...props}
                    initialCounts={ctx.repositorySyncCounts}
                />
            ),
        });
    }

    const upgrade = getUpgradeAvailability(ctx);
    if (upgrade) {
        banners.push({
            id: 'upgradeAvailable',
            priority: BannerPriority.UPGRADE_AVAILABLE,
            dismissible: true,
            audience: 'owner',
            render: (props) => (
                <UpgradeAvailableBanner
                    {...props}
                    currentVersion={upgrade.currentVersion}
                    latestVersion={upgrade.latestVersion}
                />
            ),
        });
    }

    return banners;
}

// Fork: license verification removed. License expiry helpers deleted; the
// license is always valid.

function getUpgradeAvailability(
    ctx: BannerContext,
): { currentVersion: string; latestVersion: string } | null {
    if (!ctx.latestVersion) {
        return null;
    }
    const current = parseVersion(ctx.currentVersion);
    const latest = parseVersion(ctx.latestVersion);
    if (!current || !latest) {
        return null;
    }
    if (compareVersions(current, latest) >= 0) {
        return null;
    }
    return {
        currentVersion: formatVersion(current),
        latestVersion: formatVersion(latest),
    };
}
