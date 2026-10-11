import { describe, expect, test, vi } from 'vitest';
import { OrgRole, type License } from '@sourcebot/db';
import type { OfflineLicenseMetadata } from '@sourcebot/shared';

// Stub the rendered banner components — these tests assert on descriptor
// metadata only (id, priority, etc), so avoiding their React/Next.js import
// chains keeps the suite focused on resolver logic.
// Stub @sourcebot/shared: importing its real index initializes env-backed
// server code that can't run in the test environment. The resolver only
// needs the threshold constant; type imports are erased at runtime.
vi.mock('@sourcebot/shared', () => ({
    STALE_ONLINE_LICENSE_THRESHOLD_MS: 7 * 24 * 60 * 60 * 1000,
    STALE_ONLINE_LICENSE_WARNING_THRESHOLD_MS: 48 * 60 * 60 * 1000,
}));

vi.mock('./permissionSyncBanner', () => ({ PermissionSyncBanner: () => null }));
vi.mock('./licenseExpiredBanner', () => ({ LicenseExpiredBanner: () => null }));
vi.mock('./licenseExpiryHeadsUpBanner', () => ({ LicenseExpiryHeadsUpBanner: () => null }));
vi.mock('./licenseReboundElsewhereBanner', () => ({ LicenseReboundElsewhereBanner: () => null }));
vi.mock('./invoicePastDueBanner', () => ({ InvoicePastDueBanner: () => null }));
vi.mock('./servicePingFailedBanner', () => ({ ServicePingFailedBanner: () => null }));
vi.mock('./trialBanner', () => ({ TrialBanner: () => null }));
vi.mock('./upgradeAvailableBanner', () => ({ UpgradeAvailableBanner: () => null }));
vi.mock('./repositorySyncIssuesBanner', () => ({ RepositorySyncIssuesBanner: () => null }));
vi.mock('./repositoryFirstSyncBanner', () => ({ RepositoryFirstSyncBanner: () => null }));
vi.mock('./connectionSyncIssuesBanner', () => ({ ConnectionSyncIssuesBanner: () => null }));
vi.mock('./connectionFirstSyncBanner', () => ({ ConnectionFirstSyncBanner: () => null }));

import { resolveActiveBanner, type BannerContext } from './bannerResolver';

const NOW = new Date('2026-04-21T12:00:00Z');
const TODAY = '2026-04-21';
const YESTERDAY = '2026-04-20';

const hoursFromNow = (h: number) => new Date(NOW.getTime() + h * 60 * 60 * 1000);
const daysFromNow = (d: number) => new Date(NOW.getTime() + d * 24 * 60 * 60 * 1000);

const makeLicense = (overrides: Partial<License> = {}): License => ({
    id: 'lic_1',
    orgId: 1,
    activationCode: 'code',
    entitlements: [],
    seats: null,
    status: null,
    planName: null,
    unitAmount: null,
    currency: null,
    interval: null,
    intervalCount: null,
    nextRenewalAt: null,
    nextRenewalAmount: null,
    cancelAt: null,
    trialEnd: null,
    hasPaymentMethod: null,
    yearlyTermStartedAt: null,
    yearlyTermEndsAt: null,
    yearlyTotalQuartersInTerm: null,
    yearlyCurrentQuarterNumber: null,
    yearlyCurrentQuarterStartedAt: null,
    yearlyCurrentQuarterEndsAt: null,
    yearlyCommittedSeats: null,
    yearlyOverageSeats: null,
    yearlyBillableOverageSeats: null,
    yearlyPeakSeats: null,
    lastSyncAt: NOW,
    lastSyncErrorCode: null,
    licenseAssertion: null,
    createdAt: NOW,
    updatedAt: NOW,
    ...overrides,
});

const makeOfflineLicense = (overrides: Partial<OfflineLicenseMetadata> = {}): OfflineLicenseMetadata => ({
    id: 'offline_1',
    expiryDate: daysFromNow(365).toISOString(),
    ...overrides,
});

const makeContext = (overrides: Partial<BannerContext> = {}): BannerContext => ({
    role: OrgRole.OWNER,
    license: null,
    offlineLicense: null,
    hasPermissionSyncEntitlement: false,
    hasPendingFirstSync: false,
    permissionSyncIssues: [],
    connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 0, warningCount: 0 },
    repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 0, warningCount: 0 },
    dismissals: {},
    today: TODAY,
    now: NOW,
    currentVersion: 'v4.17.2',
    latestVersion: null,
    ...overrides,
});

describe('resolveActiveBanner', () => {
    describe('priority ordering', () => {
        test('returns null when no conditions match', () => {
            expect(resolveActiveBanner(makeContext())).toBeNull();
        });

        test('returns the only candidate when one matches', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
            }));
            expect(result?.id).toBe('permissionSync');
        });

        test('shows permission sync banner when an account requires reauthentication', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                permissionSyncIssues: [{
                    accountId: 'account_1',
                    providerId: 'bitbucket-server',
                    providerType: 'bitbucket-server',
                    reason: 'REAUTHENTICATION_REQUIRED',
                    occurredAt: NOW.toISOString(),
                    isSyncing: false,
                }],
            }));
            expect(result?.id).toBe('permissionSync');
            expect(result?.dismissible).toBe(false);
        });

        // Fork: license verification removed. License banners never appear.
        test('license expiry no longer produces a banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({ status: 'canceled' }),
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
            }));
            expect(result?.id).toBe('permissionSync');
        });

        test('permission sync outranks license expiry heads-up', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({ cancelAt: hoursFromNow(12) }),
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
            }));
            expect(result?.id).toBe('permissionSync');
        });

        test('permission sync outranks repository sync failures', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result?.id).toBe('permissionSync');
        });

        test('connection sync failures outrank repository sync failures', () => {
            const result = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result?.id).toBe('connectionSyncFailed');
        });

        test('repository sync failures outrank trial notices', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'trialing',
                    trialEnd: daysFromNow(7),
                }),
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result?.id).toBe('repositorySyncFailed');
        });

        // Fork: license verification removed. Trial banners never appear.
        test('trial license does not produce a banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'trialing',
                    trialEnd: daysFromNow(7),
                }),
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 0, warningCount: 1 },
            }));
            expect(result?.id).toBe('repositorySyncWarning');
        });
    });

    describe('connection sync issues', () => {
        test('shows failures and warnings as separate banners', () => {
            const failed = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 2, warningCount: 3 },
            }));
            expect(failed?.id).toBe('connectionSyncFailed');
            expect(failed?.dismissible).toBe(true);
            expect(failed?.audience).toBe('owner');

            const warning = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 2, warningCount: 3 },
                dismissals: { connectionSyncFailed: TODAY },
            }));
            expect(warning?.id).toBe('connectionSyncWarning');
            expect(warning?.dismissible).toBe(true);
        });

        test('hides connection sync issues from members', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 1 },
            }));
            expect(result).toBeNull();
        });
    });

    describe('connection first sync', () => {
        test('shows first-time syncing connections to owners', () => {
            const result = resolveActiveBanner(makeContext({
                connectionSyncCounts: {
                    firstTimeSyncingCount: 2,
                    failedCount: 0,
                    warningCount: 0,
                },
            }));

            expect(result?.id).toBe('connectionFirstSync');
            expect(result?.dismissible).toBe(true);
            expect(result?.audience).toBe('owner');
        });

        test('hides first-time syncing connections from members', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                connectionSyncCounts: {
                    firstTimeSyncingCount: 2,
                    failedCount: 0,
                    warningCount: 0,
                },
            }));

            expect(result).toBeNull();
        });
    });

    describe('repository sync issues', () => {
        test('shows failures to owners', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 2, warningCount: 1 },
            }));
            expect(result?.id).toBe('repositorySyncFailed');
            expect(result?.dismissible).toBe(true);
            expect(result?.audience).toBe('owner');
        });

        test('shows warnings when there are no failures', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 0, warningCount: 2 },
            }));
            expect(result?.id).toBe('repositorySyncWarning');
            expect(result?.dismissible).toBe(true);
        });

        test('hides issues from members', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 1 },
            }));
            expect(result).toBeNull();
        });

        test('does not let a warning dismissal suppress a later failure', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 1 },
                dismissals: { repositorySyncWarning: TODAY },
            }));
            expect(result?.id).toBe('repositorySyncFailed');
        });

        test('hides failures dismissed today', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 1 },
                dismissals: { repositorySyncFailed: TODAY },
            }));
            expect(result).toBeNull();
        });
    });

    describe('repository first sync', () => {
        test('shows first-time syncing repositories to owners', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: {
                    firstTimeSyncingCount: 3,
                    failedCount: 0,
                    warningCount: 0,
                },
            }));

            expect(result?.id).toBe('repositoryFirstSync');
            expect(result?.dismissible).toBe(true);
            expect(result?.audience).toBe('owner');
        });

        test('hides first-time syncing repositories from members', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                repositorySyncCounts: {
                    firstTimeSyncingCount: 3,
                    failedCount: 0,
                    warningCount: 0,
                },
            }));

            expect(result).toBeNull();
        });

        test('repository warnings take priority over first-time syncing', () => {
            const result = resolveActiveBanner(makeContext({
                repositorySyncCounts: {
                    firstTimeSyncingCount: 3,
                    failedCount: 0,
                    warningCount: 1,
                },
            }));

            expect(result?.id).toBe('repositorySyncWarning');
        });
    });

    describe('audience filtering', () => {
        test('hides owner-only banner from members', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result).toBeNull();
        });

        test('hides owner-only banner from anonymous viewers', () => {
            const result = resolveActiveBanner(makeContext({
                role: null,
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result).toBeNull();
        });

        test('shows owner-only banner to owners', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.OWNER,
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result?.id).toBe('connectionSyncFailed');
        });
    });

    describe('dismissal filtering', () => {
        test('filters out dismissible banner dismissed today', () => {
            const result = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
                dismissals: { connectionSyncFailed: TODAY },
            }));
            expect(result).toBeNull();
        });

        test('shows dismissible banner dismissed yesterday', () => {
            const result = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
                dismissals: { connectionSyncFailed: YESTERDAY },
            }));
            expect(result?.id).toBe('connectionSyncFailed');
        });

        test('shows dismissible banner with no cookie set', () => {
            const result = resolveActiveBanner(makeContext({
                connectionSyncCounts: { firstTimeSyncingCount: 0, failedCount: 1, warningCount: 0 },
            }));
            expect(result?.id).toBe('connectionSyncFailed');
        });

        test('ignores dismissal cookie on non-dismissible banners', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
                dismissals: { permissionSync: TODAY },
            }));
            expect(result?.id).toBe('permissionSync');
        });
    });

    // Fork: license verification removed. License expiry banners never appear.
    describe('offline license expiry', () => {
        test('expired offline license → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                offlineLicense: makeOfflineLicense({ expiryDate: hoursFromNow(-1).toISOString() }),
            }));
            expect(result).toBeNull();
        });
    });

    describe('online license expiry', () => {
        test('canceled online license → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({ status: 'canceled' }),
            }));
            expect(result).toBeNull();
        });
    });

    describe('invoice past due', () => {
        test('past_due license → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({ status: 'past_due' }),
            }));
            expect(result).toBeNull();
        });
    });

    describe('service ping staleness', () => {
        test('stale lastSyncAt → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'active',
                    lastSyncAt: new Date(NOW.getTime() - 30 * 24 * 60 * 60 * 1000),
                }),
            }));
            expect(result).toBeNull();
        });
    });

    // Fork: license verification removed. The rebound banner never appears.
    describe('license rebound elsewhere', () => {
        test('rebound error code → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'active',
                    lastSyncErrorCode: 'ACTIVATION_CODE_BOUND_TO_DIFFERENT_INSTANCE',
                }),
            }));
            expect(result).toBeNull();
        });
    });

    // Fork: license verification removed. The trial banner never appears.
    describe('trial', () => {
        test('trialing license → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'trialing',
                    trialEnd: daysFromNow(10),
                }),
            }));
            expect(result).toBeNull();
        });
    });

    describe('permission sync', () => {
        test('entitlement + pending → permissionSync', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: true,
            }));
            expect(result?.id).toBe('permissionSync');
        });

        test('no entitlement + pending → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: false,
                hasPendingFirstSync: true,
            }));
            expect(result).toBeNull();
        });

        test('entitlement + not pending → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                hasPermissionSyncEntitlement: true,
                hasPendingFirstSync: false,
            }));
            expect(result).toBeNull();
        });
    });

    describe('upgrade available', () => {
        test('newer latest → upgradeAvailable (dismissible, owner)', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.18.0',
            }));
            expect(result?.id).toBe('upgradeAvailable');
            expect(result?.dismissible).toBe(true);
            expect(result?.audience).toBe('owner');
        });

        test('equal versions → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.17.2',
            }));
            expect(result).toBeNull();
        });

        test('current ahead of latest → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.18.0',
                latestVersion: 'v4.17.2',
            }));
            expect(result).toBeNull();
        });

        test('null latestVersion → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: null,
            }));
            expect(result).toBeNull();
        });

        test('unparseable latestVersion → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: 'not-a-version',
            }));
            expect(result).toBeNull();
        });

        test('unparseable currentVersion → no banner', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'dev',
                latestVersion: 'v4.18.0',
            }));
            expect(result).toBeNull();
        });

        test('hidden from non-owners', () => {
            const result = resolveActiveBanner(makeContext({
                role: OrgRole.MEMBER,
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.18.0',
            }));
            expect(result).toBeNull();
        });

        test('dismissed today → filtered out', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.18.0',
                dismissals: { upgradeAvailable: TODAY },
            }));
            expect(result).toBeNull();
        });

        test('dismissed yesterday → still shown', () => {
            const result = resolveActiveBanner(makeContext({
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.18.0',
                dismissals: { upgradeAvailable: YESTERDAY },
            }));
            expect(result?.id).toBe('upgradeAvailable');
        });

        // Fork: license verification removed. The ping staleness banner never
        // appears; the upgrade banner shows instead.
        test('stale ping does not outrank upgrade', () => {
            const result = resolveActiveBanner(makeContext({
                license: makeLicense({
                    status: 'active',
                    lastSyncAt: new Date(NOW.getTime() - (48 * 60 * 60 * 1000 + 60_000)),
                }),
                currentVersion: 'v4.17.2',
                latestVersion: 'v4.18.0',
            }));
            expect(result?.id).toBe('upgradeAvailable');
        });
    });
});
