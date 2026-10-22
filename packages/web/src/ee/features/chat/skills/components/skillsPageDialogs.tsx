import { AlertTriangleIcon } from "lucide-react";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DeleteWorkspaceSkillDialog } from "@/ee/features/chat/skills/components/workspaceSkillShared";
import { type DetailSkill } from "@/ee/features/chat/skills/components/skillsPageShared";
import { type AgentSkillSyncField } from "@/ee/features/chat/skills/types";
import { useTranslations } from "@/i18n/I18nProvider";

interface PendingDiscardTransition {
    run: () => void;
}

interface ConfirmSyncOverwrite {
    skill: DetailSkill;
    overwrittenFields: AgentSkillSyncField[];
}

type SkillsTranslator = ReturnType<typeof useTranslations<"settings">>;

const formatSyncField = (field: AgentSkillSyncField, t: SkillsTranslator) =>
    field === "description" ? t("skillsPage.dialogs.fieldDescription") : t("skillsPage.dialogs.fieldInstructions");

interface SkillsPageDialogsProps {
    pendingDiscard: PendingDiscardTransition | null;
    navGuardActive: boolean;
    confirmSyncOverwrite: ConfirmSyncOverwrite | null;
    confirmMakePersonal: DetailSkill | null;
    confirmPublishSynced: DetailSkill | null;
    confirmDeletePersonal: DetailSkill | null;
    confirmDeleteShared: DetailSkill | null;
    scopePendingId: string | null;
    deletingId: string | null;
    onCancelPendingDiscard: () => void;
    onConfirmPendingDiscard: () => void;
    onCancelNavigation: () => void;
    onConfirmNavigation: () => void;
    onCloseSyncOverwrite: () => void;
    onConfirmSyncOverwrite: (skill: DetailSkill) => void;
    onCloseMakePersonal: () => void;
    onConfirmMakePersonal: (skill: DetailSkill) => void;
    onClosePublishSynced: () => void;
    onConfirmPublishSynced: (skill: DetailSkill) => void;
    onCloseDeletePersonal: () => void;
    onConfirmDeletePersonal: (skill: DetailSkill) => void;
    onCloseDeleteShared: () => void;
    onConfirmDeleteShared: () => void;
}

export function SkillsPageDialogs({
    pendingDiscard,
    navGuardActive,
    confirmSyncOverwrite,
    confirmMakePersonal,
    confirmPublishSynced,
    confirmDeletePersonal,
    confirmDeleteShared,
    scopePendingId,
    deletingId,
    onCancelPendingDiscard,
    onConfirmPendingDiscard,
    onCancelNavigation,
    onConfirmNavigation,
    onCloseSyncOverwrite,
    onConfirmSyncOverwrite,
    onCloseMakePersonal,
    onConfirmMakePersonal,
    onClosePublishSynced,
    onConfirmPublishSynced,
    onCloseDeletePersonal,
    onConfirmDeletePersonal,
    onCloseDeleteShared,
    onConfirmDeleteShared,
}: SkillsPageDialogsProps) {
    const t = useTranslations("settings");
    const tCommon = useTranslations("common");
    return (
        <>
            <AlertDialog
                open={pendingDiscard !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        onCancelPendingDiscard();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.discardTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("skillsPage.dialogs.discardDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCancelPendingDiscard}>{t("skillsPage.dialogs.keepEditing")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onConfirmPendingDiscard}
                        >
                            {t("skillsPage.dialogs.discardChanges")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={navGuardActive}
                onOpenChange={(open) => {
                    if (!open) {
                        onCancelNavigation();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.discardTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("skillsPage.dialogs.discardNavDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCancelNavigation}>{t("skillsPage.dialogs.keepEditing")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={onConfirmNavigation}
                        >
                            {t("skillsPage.dialogs.discardChanges")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmSyncOverwrite !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        onCloseSyncOverwrite();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.syncOverwriteTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {confirmSyncOverwrite && (confirmSyncOverwrite.overwrittenFields.length === 2
                                ? t("skillsPage.dialogs.syncOverwriteDescriptionBoth", { name: confirmSyncOverwrite.skill.name })
                                : t("skillsPage.dialogs.syncOverwriteDescriptionSingle", { field: formatSyncField(confirmSyncOverwrite.overwrittenFields[0], t), name: confirmSyncOverwrite.skill.name }))}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={onCloseSyncOverwrite}>{t("skillsPage.dialogs.keepMyEdits")}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmSyncOverwrite) {
                                    onConfirmSyncOverwrite(confirmSyncOverwrite.skill);
                                }
                            }}
                        >
                            {t("skillsPage.dialogs.overwriteAndSync")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmMakePersonal !== null}
                onOpenChange={(open) => {
                    if (!open && scopePendingId === null) {
                        onCloseMakePersonal();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.makePersonalTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("skillsPage.dialogs.makePersonalDescription", { name: confirmMakePersonal?.name ?? "", slug: confirmMakePersonal?.slug ?? "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={scopePendingId !== null}>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={scopePendingId !== null}
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmMakePersonal) {
                                    onConfirmMakePersonal(confirmMakePersonal);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {scopePendingId !== null ? t("skillsPage.dialogs.makingPersonal") : t("skillsPage.dialogs.makePersonal")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmPublishSynced !== null}
                onOpenChange={(open) => {
                    if (!open && scopePendingId === null) {
                        onClosePublishSynced();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.publishSyncedTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("skillsPage.dialogs.publishSyncedDescription", { name: confirmPublishSynced?.name ?? "", repo: confirmPublishSynced?.source?.repoName ?? "", slug: confirmPublishSynced?.slug ?? "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="flex gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-sm text-muted-foreground">
                        <AlertTriangleIcon className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
                        <p>
                            {t("skillsPage.dialogs.publishSyncedWarning", { repo: confirmPublishSynced?.source?.repoName ?? "" })}
                        </p>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={scopePendingId !== null}>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={scopePendingId !== null}
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmPublishSynced) {
                                    onConfirmPublishSynced(confirmPublishSynced);
                                }
                            }}
                        >
                            {scopePendingId !== null ? t("skillsPage.dialogs.sharing") : t("skillsPage.dialogs.shareSkill")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog
                open={confirmDeletePersonal !== null}
                onOpenChange={(open) => {
                    if (!open && deletingId === null) {
                        onCloseDeletePersonal();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t("skillsPage.dialogs.deletePersonalTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t("skillsPage.dialogs.deletePersonalDescription", { name: confirmDeletePersonal?.name ?? "", slug: confirmDeletePersonal?.slug ?? "" })}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deletingId !== null}>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            disabled={deletingId !== null}
                            onClick={(event) => {
                                event.preventDefault();
                                if (confirmDeletePersonal) {
                                    onConfirmDeletePersonal(confirmDeletePersonal);
                                }
                            }}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {deletingId !== null ? t("skillsPage.dialogs.deleting") : tCommon("delete")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <DeleteWorkspaceSkillDialog
                skill={confirmDeleteShared}
                isDeleting={deletingId !== null}
                onOpenChange={(open) => {
                    if (!open && deletingId === null) {
                        onCloseDeleteShared();
                    }
                }}
                onConfirm={onConfirmDeleteShared}
            />
        </>
    );
}
