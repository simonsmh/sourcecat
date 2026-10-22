import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { McpServerToolPermission } from '@sourcecat/db';
import { BanIcon, CircleCheckIcon, HandIcon, type LucideIcon } from 'lucide-react';
import type { ToolSummary } from './types';
import { useTranslations } from '@/i18n/I18nProvider';

interface McpServerToolPermissionDisplay {
    labelKey: 'allowed' | 'needsApproval' | 'blocked';
    icon: LucideIcon;
    iconClassName: string;
    selectedClassName: string;
}

export const MCP_SERVER_TOOL_PERMISSION_DISPLAY = {
    ALLOWED: {
        labelKey: 'allowed',
        icon: CircleCheckIcon,
        iconClassName: 'text-green-500',
        selectedClassName: '!border-green-600 !bg-green-600 !text-white !opacity-100 shadow-sm ring-2 ring-green-600/30',
    },
    NEEDS_APPROVAL: {
        labelKey: 'needsApproval',
        icon: HandIcon,
        iconClassName: 'text-primary',
        selectedClassName: '!border-primary !bg-primary !text-primary-foreground !opacity-100 shadow-sm ring-2 ring-primary/30',
    },
    DISABLED: {
        labelKey: 'blocked',
        icon: BanIcon,
        iconClassName: 'text-destructive',
        selectedClassName: '!border-destructive !bg-destructive !text-destructive-foreground !opacity-100 shadow-sm ring-2 ring-destructive/30',
    },
} satisfies Record<McpServerToolPermission, McpServerToolPermissionDisplay>;

export const MCP_SERVER_TOOL_PERMISSION_OPTIONS: Array<McpServerToolPermissionDisplay & {
    value: McpServerToolPermission;
}> = [
    { value: 'ALLOWED', ...MCP_SERVER_TOOL_PERMISSION_DISPLAY.ALLOWED },
    { value: 'NEEDS_APPROVAL', ...MCP_SERVER_TOOL_PERMISSION_DISPLAY.NEEDS_APPROVAL },
    { value: 'DISABLED', ...MCP_SERVER_TOOL_PERMISSION_DISPLAY.DISABLED },
];

export function getMcpServerToolPermissionDisplay(permission: McpServerToolPermission) {
    return MCP_SERVER_TOOL_PERMISSION_DISPLAY[permission];
}

export function ToolHintBadges({ annotations }: { annotations?: ToolSummary['annotations'] }) {
    const t = useTranslations("settings");

    if (!annotations) {
        return null;
    }

    return (
        <>
            {annotations.readOnlyHint === true && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                    {t("askPage.toolPermissions.readOnly")}
                </Badge>
            )}
            {annotations.destructiveHint === true && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-destructive">
                    {t("askPage.toolPermissions.destructive")}
                </Badge>
            )}
            {annotations.idempotentHint === true && (
                <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-medium text-muted-foreground">
                    {t("askPage.toolPermissions.idempotent")}
                </Badge>
            )}
        </>
    );
}

export function ToolPermissionBadge({ permission }: { permission?: McpServerToolPermission }) {
    const t = useTranslations("settings");

    if (!permission) {
        return null;
    }

    const display = getMcpServerToolPermissionDisplay(permission);
    const Icon = display.icon;

    return (
        <Badge
            variant="outline"
            className={cn(
                "px-1.5 py-0 text-[10px] font-medium transition-none",
                display.iconClassName,
            )}
        >
            <Icon className="mr-1 h-3 w-3" />
            {t(`askPage.toolPermissions.${display.labelKey}`)}
        </Badge>
    );
}
