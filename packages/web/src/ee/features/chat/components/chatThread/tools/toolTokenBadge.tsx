'use client';

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { getShortenedNumberDisplayString } from '@/lib/utils';
import { useTranslations } from "@/i18n/I18nProvider";

export const ToolTokenBadge = ({ estimatedOutputTokens }: { estimatedOutputTokens: number }) => {
    const t = useTranslations("chat");
    return (
    <Tooltip>
        <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground flex-shrink-0 cursor-help">
                {t("thread.tokenBadge", { value: getShortenedNumberDisplayString(estimatedOutputTokens, 0) })}
            </span>
        </TooltipTrigger>
        <TooltipContent side="bottom">
            <div className="max-w-xs text-xs">
                {t("thread.tokenBadgeTooltip")}
            </div>
        </TooltipContent>
    </Tooltip>
    );
};