import { beforeEach, describe, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    logger: {
        error: vi.fn(),
        warn: vi.fn(),
        info: vi.fn(),
        debug: vi.fn(),
    },
    warmModelCapabilitiesCatalog: vi.fn(),
}));

vi.mock('@/prisma', () => ({
    __unsafePrisma: {},
}));

vi.mock('@sourcecat/shared', () => ({
    createLogger: () => mocks.logger,
    env: {},
}));

vi.mock('./lib/constants', () => ({
    SINGLE_TENANT_ORG_ID: 1,
}));

vi.mock('@/features/chat/utils.server', () => ({
    warmModelCapabilitiesCatalog: mocks.warmModelCapabilitiesCatalog,
}));

import { initialize } from './initialize';

describe('initialize', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Fork: license verification removed. No license server is contacted and
    // no telemetry jobs are started.
    test('does not contact any official servers on startup', async () => {
        await expect(initialize()).resolves.toBeUndefined();

        expect(mocks.warmModelCapabilitiesCatalog).toHaveBeenCalledOnce();
    });
});
