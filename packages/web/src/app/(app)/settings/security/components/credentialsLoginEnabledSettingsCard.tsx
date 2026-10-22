"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { setCredentialsLoginEnabled } from "@/app/(app)/settings/security/actions"
import { isServiceError } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { BasicSettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { useTranslations } from "@/i18n/I18nProvider"

interface CredentialsLoginEnabledSettingsCardProps {
    isCredentialsLoginEnabled: boolean
}

export function CredentialsLoginEnabledSettingsCard({
    isCredentialsLoginEnabled,
}: CredentialsLoginEnabledSettingsCardProps) {
    const [enabled, setEnabled] = useState(isCredentialsLoginEnabled)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const t = useTranslations("settings")

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)
        try {
            const result = await setCredentialsLoginEnabled(checked)

            if (isServiceError(result)) {
                toast({
                    title: t("securityPage.error"),
                    description: result.message,
                    variant: "destructive",
                })
                return
            }

            setEnabled(checked)
        } catch (error) {
            console.error("Error updating email login setting:", error)
            toast({
                title: t("securityPage.error"),
                description: t("securityPage.credentialsLogin.updateFailed"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BasicSettingsCard
            name={t("securityPage.credentialsLogin.name")}
            description={t("securityPage.credentialsLogin.description")}
        >
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
        </BasicSettingsCard>
    )
}
