'use client';

import { LoadingButton } from '@/components/ui/loading-button';
import { ExternalLink } from 'lucide-react';
import type { ButtonProps } from '@/components/ui/button';
import { useConnectMcp } from '@/ee/features/chat/mcp/hooks/useConnectMcp';
import { useTranslations } from '@/i18n/I18nProvider';

interface ConnectMcpButtonProps {
    serverId: string;
    isConnected?: boolean;
    isAuthExpired?: boolean;
    size?: ButtonProps['size'];
    variant?: ButtonProps['variant'];
    returnTo?: string;
    className?: string;
}

export function ConnectMcpButton({ serverId, isConnected, isAuthExpired, size, variant, returnTo, className }: ConnectMcpButtonProps) {
    const { connect, loadingServerId } = useConnectMcp({ returnTo });
    const t = useTranslations("settings");
    const loading = loadingServerId === serverId;

    const isSuggested = !isConnected && !isAuthExpired;
    const buttonLabel = isSuggested ? t("askPage.account.connect") : t("askPage.account.reconnect");
    const defaultVariant = isConnected ? "outline" as const : undefined;

    return (
        <LoadingButton
            onClick={() => connect(serverId)}
            loading={loading}
            variant={variant ?? defaultVariant}
            size={size}
            className={className}
        >
            {buttonLabel}
            {!isSuggested && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
        </LoadingButton>
    );
}
