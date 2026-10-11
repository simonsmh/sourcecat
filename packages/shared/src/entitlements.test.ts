import { describe, test, expect, vi, beforeEach } from 'vitest';
import type { License } from '@sourcebot/db';

const mocks = vi.hoisted(() => ({
    env: {
        SOURCEBOT_PUBLIC_KEY_PATH: '/tmp/test-key',
        SOURCEBOT_EE_LICENSE_KEY: undefined as string | undefined,
        SOURCEBOT_INSTALL_ID: 'test-install',
    } as Record<string, string | undefined>,
    verifySignature: vi.fn(() => true),
}));

vi.mock('./env.server.js', () => ({
    env: mocks.env,
}));

vi.mock('./crypto.js', () => ({
    verifySignature: mocks.verifySignature,
}));

vi.mock('./logger.js', () => ({
    createLogger: () => ({
        error: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        debug: vi.fn(),
    }),
}));

import {
    isAnonymousAccessAvailable,
    getEntitlements,
    hasEntitlement,
    isValidLicenseActive,
    isValidOfflineLicenseActive,
    isValidOnlineLicenseActive,
    getSeatCap,
    getOfflineLicenseMetadata,
} from './entitlements.js';

// Fork: license verification removed. All entitlements are always granted,
// no signature verification is performed, and no license server is contacted.

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
    lastSyncAt: null,
    lastSyncErrorCode: null,
    licenseAssertion: null,
    yearlyTermStatus: null,
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
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
});

describe('getEntitlements', () => {
    test('returns all entitlements when license is null', () => {
        const entitlements = getEntitlements(null);
        expect(entitlements.length).toBeGreaterThan(0);
        expect(entitlements).toContain('sso');
        expect(entitlements).toContain('permission-syncing');
    });

    test('returns all entitlements regardless of license status', () => {
        const entitlements = getEntitlements(makeLicense({ status: 'canceled' }));
        expect(entitlements.length).toBeGreaterThan(0);
    });

    test('does not consult the offline license key', () => {
        mocks.env.SOURCEBOT_EE_LICENSE_KEY = 'sourcebot_ee_not-valid-base64-or-json';
        const entitlements = getEntitlements(null);
        expect(entitlements.length).toBeGreaterThan(0);
    });
});

describe('hasEntitlement', () => {
    test('always returns true', () => {
        expect(hasEntitlement('sso', null)).toBe(true);
        expect(hasEntitlement('permission-syncing', makeLicense({ status: 'canceled' }))).toBe(true);
        expect(hasEntitlement('audit', makeLicense({ status: 'past_due' }))).toBe(true);
    });
});

describe('isAnonymousAccessAvailable', () => {
    test('always returns true', () => {
        expect(isAnonymousAccessAvailable(null)).toBe(true);
        expect(isAnonymousAccessAvailable(makeLicense({ status: 'canceled' }))).toBe(true);
    });
});

describe('isValidLicenseActive', () => {
    test('always returns true', () => {
        expect(isValidLicenseActive(null)).toBe(true);
        expect(isValidLicenseActive(makeLicense({ status: 'canceled' }))).toBe(true);
        expect(isValidOfflineLicenseActive()).toBe(true);
        expect(isValidOnlineLicenseActive(null)).toBe(true);
    });
});

describe('getSeatCap', () => {
    test('always returns undefined (no seat cap)', () => {
        expect(getSeatCap()).toBeUndefined();
        mocks.env.SOURCEBOT_EE_LICENSE_KEY = 'sourcebot_ee_not-valid-base64-or-json';
        expect(getSeatCap()).toBeUndefined();
    });
});

describe('getOfflineLicenseMetadata', () => {
    test('returns null when no license key is configured', () => {
        mocks.env.SOURCEBOT_EE_LICENSE_KEY = undefined;
        expect(getOfflineLicenseMetadata()).toBeNull();
    });
});
