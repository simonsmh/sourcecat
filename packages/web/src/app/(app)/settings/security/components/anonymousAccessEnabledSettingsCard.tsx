"use client"

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { setAnonymousAccessStatus } from "@/app/(app)/settings/security/actions"
import { isServiceError } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { BasicSettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { useTranslations } from "@/i18n/I18nProvider"

interface AnonymousAccessEnabledSettingsCardProps {
    anonymousAccessEnabled: boolean
}

export function AnonymousAccessEnabledSettingsCard({ anonymousAccessEnabled }: AnonymousAccessEnabledSettingsCardProps) {
    const [enabled, setEnabled] = useState(anonymousAccessEnabled)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const t = useTranslations("settings")

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)
        try {
            const result = await setAnonymousAccessStatus(checked)
            
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
            console.error("Error updating anonymous access setting:", error)
            toast({
                title: t("securityPage.error"),
                description: t("securityPage.anonymousAccess.updateFailed"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BasicSettingsCard
            name={t("securityPage.anonymousAccess.name")}
            description={t("securityPage.anonymousAccess.description")}
        >
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isLoading}
            />
        </BasicSettingsCard>
    )
}