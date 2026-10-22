"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { setScimEnabled } from "@/ee/features/scim/actions"
import { isServiceError } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { BasicSettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { useTranslations } from "@/i18n/I18nProvider"
import { useRouter } from "next/navigation"

interface ScimEnabledSettingsCardProps {
    isScimEnabled: boolean
}

export const ScimEnabledSettingsCard = ({
    isScimEnabled,
}: ScimEnabledSettingsCardProps) => {
    const [enabled, setEnabled] = useState(isScimEnabled)
    const [isLoading, setIsLoading] = useState(false)
    // The toggle value awaiting confirmation; null when no dialog is open.
    const [pendingChange, setPendingChange] = useState<boolean | null>(null)
    const { toast } = useToast()
    const t = useTranslations("settings")
    const tCommon = useTranslations("common")
    const router = useRouter()

    // Both directions change how membership is governed, so confirm either way.
    const handleToggle = (checked: boolean) => {
        setPendingChange(checked)
    }

    const applyToggle = async (checked: boolean) => {
        setIsLoading(true)
        try {
            const result = await setScimEnabled(checked)

            if (isServiceError(result)) {
                toast({
                    title: t("securityPage.error"),
                    description: result.message,
                    variant: "destructive",
                })
                return
            }

            setEnabled(checked)
            router.refresh()
        } catch (error) {
            console.error("Error updating SCIM provisioning setting:", error)
            toast({
                title: t("securityPage.error"),
                description: t("securityPage.scimEnabled.updateFailed"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <BasicSettingsCard
                name={t("securityPage.scimEnabled.name")}
                description={t("securityPage.scimEnabled.description")}
            >
                <Switch
                    checked={enabled}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                />
            </BasicSettingsCard>

            <AlertDialog
                open={pendingChange !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setPendingChange(null)
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {pendingChange === false ? t("securityPage.scimEnabled.disableTitle") : t("securityPage.scimEnabled.enableTitle")}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {pendingChange === false
                                ? t("securityPage.scimEnabled.disableDescription")
                                : t("securityPage.scimEnabled.enableDescription")}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                if (pendingChange !== null) {
                                    void applyToggle(pendingChange)
                                }
                            }}
                            disabled={isLoading}
                        >
                            {pendingChange === false ? t("securityPage.scimEnabled.disable") : t("securityPage.scimEnabled.enable")}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
