'use client';

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCallback, useState } from "react";
import { useTranslations } from "@/i18n/I18nProvider";

interface DeleteChatDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onDelete: () => Promise<boolean>;
}

export const DeleteChatDialog = ({ isOpen, onOpenChange, onDelete }: DeleteChatDialogProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const t = useTranslations("chat");
    const tCommon = useTranslations("common");

    const handleDelete = useCallback(async () => {
        setIsLoading(true);
        try {
            const success = await onDelete();
            if (success) {
                onOpenChange(false);
            }
        } catch (e) {
            console.error('Failed to delete chat', e);
        } finally {
            setIsLoading(false);
        }
    }, [onDelete, onOpenChange]);

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!isLoading) {
                    onOpenChange(open);
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("deleteChatTitle")}</DialogTitle>
                    <DialogDescription>
                        {t("deleteChatDescription")}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        disabled={isLoading}
                        onClick={(e) => {
                            e.stopPropagation();
                            onOpenChange(false);
                        }}
                    >
                        {tCommon("cancel")}
                    </Button>
                    <LoadingButton
                        variant="destructive"
                        loading={isLoading}
                        onClick={handleDelete}
                    >
                        {tCommon("delete")}
                    </LoadingButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
