"use client";

import { useToast } from "@/components/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { syncConnection } from "@/features/connections/actions";
import { isServiceError } from "@/lib/utils";
import { EllipsisVertical, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";

type ConnectionActionsMenuProps = {
    connection: {
        id: number;
        name: string;
    };
    isSyncing: boolean;
    onSyncScheduled: (connectionId: number, jobId: string) => void;
};

export const ConnectionActionsMenu = ({
    connection,
    isSyncing,
    onSyncScheduled,
}: ConnectionActionsMenuProps) => {
    const [isScheduling, setIsScheduling] = useState(false);
    const { toast } = useToast();
    const t = useTranslations("settings");

    const scheduleSync = async () => {
        setIsScheduling(true);

        try {
            const response = await syncConnection(connection.id);
            if (isServiceError(response)) {
                toast({
                    variant: "destructive",
                    title: t("connectionsPage.actions.syncFailedTitle"),
                    description: response.message,
                });
                return;
            }

            onSyncScheduled(connection.id, response.jobId);
            toast({
                title: t("connectionsPage.actions.syncScheduledTitle"),
                description: t("connectionsPage.actions.syncScheduledDescription", { name: connection.name }),
            });
        } catch {
            toast({
                variant: "destructive",
                title: t("connectionsPage.actions.syncFailedTitle"),
                description: t("connectionsPage.actions.syncFailedDescription"),
            });
        } finally {
            setIsScheduling(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    aria-label={t("connectionsPage.actions.openActions", { name: connection.name })}
                >
                    <EllipsisVertical className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="gap-2"
                    disabled={isScheduling || isSyncing}
                    onSelect={() => void scheduleSync()}
                >
                    {isScheduling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <RefreshCw className="h-4 w-4" />
                    )}
                    {t("connectionsPage.actions.sync")}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
