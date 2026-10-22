"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MoreVertical } from "lucide-react";
import { OrgRole } from "@sourcecat/db";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/hooks/use-toast";
import {
    approveAccountRequest,
    cancelInvite,
    leaveOrg,
    reactivateMember,
    rejectAccountRequest,
    removeMemberFromOrg,
    suspendMember,
} from "@/features/membership/actions";
import { demoteToMember, promoteToOwner } from "@/ee/features/membership/actions";
import { type ServiceError } from "@/lib/serviceError";
import { createPathWithQueryParams, isServiceError } from "@/lib/utils";
import { type TableRowData } from "./membersTable";
import { useTranslations } from "@/i18n/I18nProvider";

type SettingsTranslator = ReturnType<typeof useTranslations<"settings">>;

type MemberAction =
    | "promote"
    | "demote"
    | "suspend"
    | "reactivate"
    | "remove"
    | "leave"
    | "cancelInvite"
    | "approveRequest"
    | "rejectRequest";

export interface MembersTableActionsProps {
    row: TableRowData;
    currentUserId: string;
    activeOwnerCount: number;
    hasOrgManagement: boolean;
    scimEnabled: boolean;
}

const getDisplayName = (row: TableRowData) => {
    if (row.kind === "invite") {
        return row.email;
    }
    return row.name ?? row.email;
};

const getActionLabel = (action: MemberAction, t: SettingsTranslator) => t(`membersPage.actions.labels.${action}`);

const getActionVerb = (action: MemberAction, t: SettingsTranslator) => t(`membersPage.actions.verbs.${action}`);

const getDialogCopy = (action: MemberAction, row: TableRowData, t: SettingsTranslator) => {
    const name = getDisplayName(row);

    switch (action) {
        case "promote": {
            const isPending = row.kind === "member" && row.suspendedAt == null && row.lastActiveAt == null;
            return {
                title: t("membersPage.actions.dialogs.promoteTitle"),
                description: isPending
                    ? t("membersPage.actions.dialogs.promotePendingDescription", { name })
                    : t("membersPage.actions.dialogs.promoteDescription", { name }),
            };
        }
        case "demote":
            return {
                title: t("membersPage.actions.dialogs.demoteTitle"),
                description: t("membersPage.actions.dialogs.demoteDescription", { name }),
            };
        case "suspend":
            return {
                title: t("membersPage.actions.dialogs.suspendTitle"),
                description: t("membersPage.actions.dialogs.suspendDescription", { name }),
            };
        case "reactivate":
            return {
                title: t("membersPage.actions.dialogs.reactivateTitle"),
                description: t("membersPage.actions.dialogs.reactivateDescription", { name }),
            };
        case "remove":
            return {
                title: t("membersPage.actions.dialogs.removeTitle"),
                description: t("membersPage.actions.dialogs.removeDescription", { name }),
            };
        case "leave":
            return {
                title: t("membersPage.actions.dialogs.leaveTitle"),
                description: t("membersPage.actions.dialogs.leaveDescription"),
            };
        case "cancelInvite":
            return {
                title: t("membersPage.actions.dialogs.cancelInviteTitle"),
                description: t("membersPage.actions.dialogs.cancelInviteDescription", { email: row.email }),
            };
        case "approveRequest":
            return {
                title: t("membersPage.actions.dialogs.approveTitle"),
                description: t("membersPage.actions.dialogs.approveDescription", { email: row.email }),
            };
        case "rejectRequest":
            return {
                title: t("membersPage.actions.dialogs.rejectTitle"),
                description: t("membersPage.actions.dialogs.rejectDescription", { email: row.email }),
            };
    }
};

const isDestructiveAction = (action: MemberAction) => {
    return ["demote", "suspend", "remove", "leave", "cancelInvite", "rejectRequest"].includes(action);
};

export const MembersTableActions = ({
    row,
    currentUserId,
    activeOwnerCount,
    hasOrgManagement,
    scimEnabled,
}: MembersTableActionsProps) => {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    const router = useRouter();
    const { toast } = useToast();
    const [pendingAction, setPendingAction] = useState<MemberAction | null>(null);
    const [confirmingAction, setConfirmingAction] = useState<MemberAction | null>(null);
    const pendingActionResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isCurrentUser = row.kind === "member" && row.id === currentUserId;
    const isSuspended = row.kind === "member" && row.suspendedAt != null;
    const isActiveMember = row.kind === "member" && row.suspendedAt == null && row.lastActiveAt != null;
    const isLastActiveOwner = isActiveMember
        && row.role === OrgRole.OWNER
        && activeOwnerCount <= 1;
    const scimDisabledTitle = scimEnabled ? t("membersPage.actions.scimTitle") : undefined;

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(row.email);
            toast({ description: t("membersPage.actions.emailCopied") });
        } catch {
            toast({ description: t("membersPage.actions.emailCopyFailed") });
        }
    };

    const copyInviteLink = async () => {
        if (row.kind !== "invite") {
            return;
        }

        try {
            const url = createPathWithQueryParams(`${window.location.origin}/redeem?invite_id=${row.id}`);
            await navigator.clipboard.writeText(url);
            toast({ description: t("membersPage.actions.inviteLinkCopied") });
        } catch {
            toast({ description: t("membersPage.actions.inviteLinkCopyFailed") });
        }
    };

    useEffect(() => {
        return () => {
            if (pendingActionResetTimeoutRef.current != null) {
                clearTimeout(pendingActionResetTimeoutRef.current);
            }
        };
    }, []);

    const clearPendingActionAfterClose = (action: MemberAction) => {
        if (pendingActionResetTimeoutRef.current != null) {
            clearTimeout(pendingActionResetTimeoutRef.current);
        }

        pendingActionResetTimeoutRef.current = setTimeout(() => {
            setPendingAction((currentAction) => currentAction === action ? null : currentAction);
            pendingActionResetTimeoutRef.current = null;
        }, 250);
    };

    const runConfirmedAction = async () => {
        if (confirmingAction == null) {
            return;
        }

        const action = confirmingAction;
        setPendingAction(action);

        let result: { success: boolean } | ServiceError;
        try {
            result = await (async () => {
                switch (action) {
                    case "promote":
                        return promoteToOwner(row.id);
                    case "demote":
                        return demoteToMember(row.id);
                    case "suspend":
                        return suspendMember(row.id);
                    case "reactivate":
                        return reactivateMember(row.id);
                    case "remove":
                        return removeMemberFromOrg(row.id);
                    case "leave":
                        return leaveOrg();
                    case "cancelInvite":
                        return cancelInvite(row.id);
                    case "approveRequest":
                        return approveAccountRequest(row.id);
                    case "rejectRequest":
                        return rejectAccountRequest(row.id);
                }
            })();
        } catch {
            toast({ description: t("membersPage.actions.failedAction", { action: getActionVerb(action, t) }) });
            setPendingAction(null);
            return;
        }

        if (isServiceError(result)) {
            toast({
                description: t("membersPage.actions.failedActionReason", { action: getActionVerb(action, t), reason: result.message }),
            });
            setPendingAction(null);
            return;
        }

        toast({ description: t("membersPage.actions.actionSuccessful", { action: getActionLabel(action, t) }) });
        setConfirmingAction(null);
        clearPendingActionAfterClose(action);
        router.refresh();
    };

    const dialogAction = confirmingAction ?? pendingAction;
    const dialogCopy = dialogAction == null ? null : getDialogCopy(dialogAction, row, t);
    const isConfirming = dialogAction != null && pendingAction === dialogAction;
    const confirmButtonClassName = dialogAction != null && isDestructiveAction(dialogAction)
        ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
        : undefined;

    return (
        <>
            <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" aria-label={t("membersPage.actions.openActions")}>
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={copyEmail}>
                        {t("membersPage.actions.copyEmail")}
                    </DropdownMenuItem>
                    {row.kind === "invite" && (
                        <>
                            <DropdownMenuItem className="cursor-pointer" onClick={copyInviteLink}>
                                {t("membersPage.actions.copyInviteLink")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-destructive"
                                onClick={() => setConfirmingAction("cancelInvite")}
                            >
                                {t("membersPage.actions.cancelInvite")}
                            </DropdownMenuItem>
                        </>
                    )}
                    {row.kind === "request" && (
                        <>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                disabled={scimEnabled}
                                title={scimDisabledTitle}
                                onClick={() => setConfirmingAction("approveRequest")}
                            >
                                {t("membersPage.actions.approveRequest")}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer text-destructive"
                                onClick={() => setConfirmingAction("rejectRequest")}
                            >
                                {t("membersPage.actions.rejectRequest")}
                            </DropdownMenuItem>
                        </>
                    )}
                    {row.kind === "member" && (
                        <>
                            {!isSuspended && row.role === OrgRole.MEMBER && (
                                <DropdownMenuItem
                                    className="cursor-pointer"
                                    disabled={!hasOrgManagement}
                                    title={!hasOrgManagement ? t("membersPage.actions.planTitle") : undefined}
                                    onClick={() => setConfirmingAction("promote")}
                                >
                                    {t("membersPage.actions.promoteToOwner")}
                                </DropdownMenuItem>
                            )}
                            {!isSuspended && row.role === OrgRole.OWNER && (
                                <DropdownMenuItem
                                    className="cursor-pointer text-destructive"
                                    disabled={!hasOrgManagement || isLastActiveOwner}
                                    title={
                                        !hasOrgManagement
                                            ? t("membersPage.actions.planTitle")
                                            : isLastActiveOwner
                                                ? t("membersPage.actions.cannotDemoteLastOwner")
                                                : undefined
                                    }
                                    onClick={() => setConfirmingAction("demote")}
                                >
                                    {t("membersPage.actions.demoteToMember")}
                                </DropdownMenuItem>
                            )}
                            {!isSuspended ? (
                                isCurrentUser ? (
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive"
                                        disabled={scimEnabled || isLastActiveOwner}
                                        title={scimDisabledTitle ?? (isLastActiveOwner ? t("membersPage.actions.cannotLeaveLastOwner") : undefined)}
                                        onClick={() => setConfirmingAction("leave")}
                                    >
                                        {t("membersPage.actions.leaveOrganization")}
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive"
                                        disabled={scimEnabled || isLastActiveOwner}
                                        title={scimDisabledTitle ?? (isLastActiveOwner ? t("membersPage.actions.cannotSuspendLastOwner") : undefined)}
                                        onClick={() => setConfirmingAction("suspend")}
                                    >
                                        {t("membersPage.actions.suspend")}
                                    </DropdownMenuItem>
                                )
                            ) : (
                                <>
                                    <DropdownMenuItem
                                        className="cursor-pointer"
                                        disabled={scimEnabled}
                                        title={scimDisabledTitle}
                                        onClick={() => setConfirmingAction("reactivate")}
                                    >
                                        {t("membersPage.actions.reactivate")}
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        className="cursor-pointer text-destructive"
                                        disabled={scimEnabled}
                                        title={scimDisabledTitle}
                                        onClick={() => setConfirmingAction("remove")}
                                    >
                                        {t("membersPage.actions.remove")}
                                    </DropdownMenuItem>
                                </>
                            )}
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={confirmingAction != null} onOpenChange={(open) => {
                if (!open) {
                    setConfirmingAction(null);
                }
            }}>
                <AlertDialogContent
                    onAnimationEnd={(event) => {
                        if (event.currentTarget.dataset.state === "closed") {
                            if (pendingActionResetTimeoutRef.current != null) {
                                clearTimeout(pendingActionResetTimeoutRef.current);
                                pendingActionResetTimeoutRef.current = null;
                            }
                            setPendingAction((currentAction) => (
                                currentAction === dialogAction ? null : currentAction
                            ));
                        }
                    }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>{dialogCopy?.title}</AlertDialogTitle>
                        <AlertDialogDescription>{dialogCopy?.description}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={pendingAction != null}>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            className={confirmButtonClassName}
                            disabled={pendingAction != null}
                            onClick={(event) => {
                                event.preventDefault();
                                runConfirmedAction();
                            }}
                        >
                            {isConfirming && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {dialogAction == null ? tCommon("confirm") : getActionLabel(dialogAction, t)}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
