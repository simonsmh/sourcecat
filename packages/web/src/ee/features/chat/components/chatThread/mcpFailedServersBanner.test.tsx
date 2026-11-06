import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { McpReconnectContext, McpReconnectContextValue } from '@/ee/features/chat/mcpReconnectContext';
import { McpFailedServersBanner } from './mcpFailedServersBanner';

const { I18nProvider } = await import("@/i18n/I18nProvider");
const enMessages = (await import("@/i18n/messages/en.json")).default;

afterEach(cleanup);

const reconnect = vi.fn();

const createContext = (
    status: 'authentication-required' | 'reconnecting' = 'authentication-required',
    isReconnectAllowed = true,
): McpReconnectContextValue => ({
    reconnectStates: {
        'server-1': {
            serverId: 'server-1',
            serverName: 'Linear',
            source: 'tool-load',
            status,
        },
    },
    isReconnectAllowed,
    reconnect,
});

const renderBanner = (context: McpReconnectContextValue) => render(
    <I18nProvider locale="en" messages={enMessages}>
        <McpReconnectContext.Provider value={context}>
            <McpFailedServersBanner
                servers={[{ serverId: 'server-1', serverName: 'Linear' }]}
                isVisible={true}
                onClose={vi.fn()}
            />
        </McpReconnectContext.Provider>
    </I18nProvider>,
);

describe('McpFailedServersBanner', () => {
    test('offers reconnect for the connector whose tools failed to load', () => {
        renderBanner(createContext());

        expect(screen.getByText('Connector "Linear" failed to load tools')).toBeTruthy();
        fireEvent.click(screen.getByRole('button', { name: 'Reconnect Linear' }));

        expect(reconnect).toHaveBeenCalledWith('server-1');
    });

    test('keeps reconnect disabled until the assistant response settles', () => {
        renderBanner(createContext('authentication-required', false));

        const button = screen.getByRole('button', { name: 'Reconnect Linear' }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });

    test('shows progress while reauthorization starts', () => {
        renderBanner(createContext('reconnecting'));

        const button = screen.getByRole('button', { name: /Reconnecting/ }) as HTMLButtonElement;
        expect(button.disabled).toBe(true);
    });
});
