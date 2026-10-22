import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('@/app/api/(client)/client', () => ({
    getMcpServersWithStatus: vi.fn(),
    getMcpServerTools: vi.fn(),
}));
vi.mock('@/ee/features/chat/mcp/actions', () => ({
    disconnectMcpServer: vi.fn(),
}));

const { AccountAskAgentEmptyState } = await import('./accountAskAgentPage');
const { I18nProvider } = await import('@/i18n/I18nProvider');
const enMessages = (await import('@/i18n/messages/en.json')).default;

function i18nWrapper({ children }: { children: React.ReactNode }) {
    return (
        <I18nProvider locale="en" messages={enMessages}>
            {children}
        </I18nProvider>
    );
}

function renderWithI18n(ui: React.ReactElement) {
    return render(ui, { wrapper: i18nWrapper });
}


afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

describe('AccountAskAgentEmptyState', () => {
    test('points owners to workspace Ask Sourcebot settings', () => {
        renderWithI18n(<AccountAskAgentEmptyState canManageConnectors={true} />);

        expect(screen.getByText('No connectors configured yet')).toBeTruthy();
        expect(screen.getByText('Open Workspace Ask Sourcebot to approve connectors for your workspace.')).toBeTruthy();
        expect(screen.getByRole('link', { name: /Open Workspace Ask Sourcebot/ }).getAttribute('href')).toBe('/settings/workspaceAskAgent');
    });

    test('tells members to contact an admin', () => {
        renderWithI18n(<AccountAskAgentEmptyState canManageConnectors={false} />);

        expect(screen.getByText('No connectors available')).toBeTruthy();
        expect(screen.getByText(/Contact your workspace admin/)).toBeTruthy();
        expect(screen.queryByRole('link', { name: /Open Workspace Ask Sourcebot/ })).toBeNull();
    });
});
