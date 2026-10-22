import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ save: vi.fn(), toast: vi.fn() }));
vi.mock('../actions', () => ({ setLoginMessage: mocks.save }));
vi.mock('@/components/hooks/use-toast', () => ({ useToast: () => ({ toast: mocks.toast }) }));
vi.mock('@/lib/utils', () => ({
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    isServiceError: (value: unknown) => !!value && typeof value === 'object' && 'errorCode' in value,
}));
const { LoginMessageSettingsCard } = await import('./loginMessageSettingsCard');
const { I18nProvider } = await import('@/i18n/I18nProvider');
const enMessages = (await import('@/i18n/messages/en.json')).default;

const renderCard = (loginMessage: string | null) =>
    render(
        <I18nProvider locale="en" messages={enMessages}>
            <LoginMessageSettingsCard loginMessage={loginMessage} />
        </I18nProvider>,
    );
beforeEach(() => {
    vi.resetAllMocks();
    mocks.save.mockResolvedValue({ success: true });
});
afterEach(cleanup);

test('saves Markdown only after editing and marks a successful save as unchanged', async () => {
    renderCard("Old message");
    const save = screen.getByRole('button', { name: 'Save changes' }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);
    const message = '    Code\n\n[Request access](https://example.com)  \nThanks';
    fireEvent.change(screen.getByRole('textbox', { name: 'Login message' }), { target: { value: message } });
    expect(save.disabled).toBe(false);
    fireEvent.click(save);
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ description: 'Login message saved.' }));
    expect(mocks.save).toHaveBeenCalledWith(message);
    expect(save.disabled).toBe(true);
});

test('previews the draft with the same rendered links used on the login page', () => {
    renderCard(null);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '[Request access](https://example.com/access)' } });
    fireEvent.keyDown(screen.getByRole('tab', { name: 'Preview' }), { key: 'Enter' });
    expect(screen.getByRole('link', { name: 'Request access' }).getAttribute('href')).toBe('https://example.com/access');
    expect(mocks.save).not.toHaveBeenCalled();
});

test('clearing a saved message sends null', async () => {
    renderCard("Old message");
    fireEvent.change(screen.getByRole('textbox'), { target: { value: ' \n ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ description: 'Login message removed.' }));
    expect(mocks.save).toHaveBeenCalledWith(null);
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('');
});

test('preserves the draft and permits retrying after a failed save', async () => {
    mocks.save.mockResolvedValueOnce({ errorCode: 'UNEXPECTED_ERROR', statusCode: 500, message: 'Could not save' });
    renderCard(null);
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'New message' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Could not save'));
    expect((screen.getByRole('textbox') as HTMLTextAreaElement).value).toBe('New message');
    expect(mocks.toast).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(mocks.toast).toHaveBeenCalledWith({ description: 'Login message saved.' }));
});
