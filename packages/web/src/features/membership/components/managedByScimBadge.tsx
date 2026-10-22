import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { type ReactNode } from "react";
import { useTranslations } from "@/i18n/I18nProvider";

interface ManagedByScimBadgeProps {
    /** Tooltip explaining the SCIM relationship in the badge's context. */
    tooltip?: ReactNode;
}

/**
 * Marks something governed by SCIM provisioning (a setting that's superseded, or
 * a member provisioned by the IdP). Pair it with a disabled control where it
 * marks a setting. The tooltip is context-specific via the `tooltip` prop.
 */
export const ManagedByScimBadge = ({
    tooltip,
}: ManagedByScimBadgeProps) => {
    const t = useTranslations("settings");
    const resolvedTooltip = tooltip ?? t("securityPage.scimDefaultTooltip");
    return (
    <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                <Badge variant="outline" className="font-normal cursor-help gap-1 shrink-0 whitespace-nowrap">
                    {t("securityPage.managedByScim")}
                    <Info className="h-3 w-3" />
                </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
                {resolvedTooltip}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
    );
};
