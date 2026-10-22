import { afterEach, describe, expect, test, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { ConnectorToolUsageList, ConnectorToolUsageTrigger } from './connectorToolUsageDisclosure';
import { I18nProvider } from '@/i18n/I18nProvider';
import enMessages from '@/i18n/messages/en.json';
import type { ReactElement, ReactNode } from 'react';
import type { McpServerToolUsageSummary, ServerToolsEntry } from '@/ee/features/chat/mcp/types';

function i18nWrapper({ children }: { children: ReactNode }) {
    return (
        <I18nProvider locale="en" messages={enMessages}>
            {children}
        </I18nProvider>
    );
}

function renderWithI18n(ui: ReactElement) {
    return render(ui, { wrapper: i18nWrapper });
}


afterEach(() => {
    cleanup();
});

function usageSummary(overrides: Partial<McpServerToolUsageSummary> = {}): McpServerToolUsageSummary {
    return {
        totalCalls: 6,
        usedToolCount: 2,
        tools: [
            { toolName: 'search_issues', totalCalls: 4, usageSharePercent: 66.666 },
            { toolName: 'get_issue', totalCalls: 2, usageSharePercent: 33.333 },
        ],
        ...overrides,
    };
}

function availableEntry(): Extract<ServerToolsEntry, { status: 'available' }> {
    return {
        status: 'available',
        serverId: 'server-1',
        tools: [
            { name: 'search_issues', title: 'Search issues' },
            { name: 'get_issue' },
            { name: 'create_issue' },
        ],
    };
}

describe('ConnectorToolUsageTrigger', () => {
    test('renders total tool calls and toggles open state', () => {
        const onOpenChange = vi.fn();
        renderWithI18n(
            <ConnectorToolUsageTrigger
                toolUsage={usageSummary()}
                isOpen={false}
                onOpenChange={onOpenChange}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: /6 tool calls/ }));

        expect(onOpenChange).toHaveBeenCalledWith(true);
    });
});

describe('ConnectorToolUsageList', () => {
    test('renders used tools with usage bars and footer', () => {
        renderWithI18n(
            <ConnectorToolUsageList
                toolUsage={usageSummary()}
                toolEntry={availableEntry()}
            />,
        );

        expect(screen.getByText('Lifetime tool usage')).toBeTruthy();
        expect(screen.getByText('Search issues')).toBeTruthy();
        expect(screen.getByText('search_issues')).toBeTruthy();
        expect(screen.getByText('get_issue')).toBeTruthy();
        expect(screen.getByText('6 total tool calls across 2 of 3 tools')).toBeTruthy();
    });

    test('renders empty usage state', () => {
        renderWithI18n(
            <ConnectorToolUsageList
                toolUsage={usageSummary({ totalCalls: 0, usedToolCount: 0, tools: [] })}
            />,
        );

        expect(screen.getByText('No tool calls yet.')).toBeTruthy();
    });

    test('does not render when closed', () => {
        renderWithI18n(
            <ConnectorToolUsageList
                toolUsage={usageSummary()}
                isOpen={false}
            />,
        );

        expect(screen.queryByText('Lifetime tool usage')).toBeNull();
    });
});
