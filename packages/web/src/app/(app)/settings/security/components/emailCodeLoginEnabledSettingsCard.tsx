"use client"

import { useState } from "react"
import { Info } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { setEmailCodeLoginEnabled } from "@/app/(app)/settings/security/actions"
import { isServiceError } from "@/lib/utils"
import { useToast } from "@/components/hooks/use-toast"
import { BasicSettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { useTranslations } from "@/i18n/I18nProvider"

interface EmailCodeLoginEnabledSettingsCardProps {
    isEmailCodeLoginEnabled: boolean
    isEmailServiceConfigured: boolean
}

export function EmailCodeLoginEnabledSettingsCard({
    isEmailCodeLoginEnabled,
    isEmailServiceConfigured,
}: EmailCodeLoginEnabledSettingsCardProps) {
    const [enabled, setEnabled] = useState(isEmailCodeLoginEnabled)
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const t = useTranslations("settings")

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)
        try {
            const result = await setEmailCodeLoginEnabled(checked)

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
            console.error("Error updating email code login setting:", error)
            toast({
                title: t("securityPage.error"),
                description: t("securityPage.emailCodeLogin.updateFailed"),
                variant: "destructive",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <BasicSettingsCard
            name={t("securityPage.emailCodeLogin.name")}
            description={t("securityPage.emailCodeLogin.description")}
            footer={!isEmailServiceConfigured && (
                <Alert className="mt-4 items-center">
                    <Info className="w-4 h-4 text-muted-foreground" />
                    <AlertDescription>
                        {t("securityPage.emailCodeLogin.requiresEmail")}{" "}
                        <a
                            href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/configuration/transactional-emails.mdx"
                            target="_blank"
                            rel="noopener"
                            className="underline text-primary hover:text-primary/80 transition-colors"
                        >
                            {t("securityPage.learnMore")}
                        </a>
                    </AlertDescription>
                </Alert>
            )}
        >
            <Switch
                checked={enabled}
                onCheckedChange={handleToggle}
                disabled={isLoading || (!isEmailServiceConfigured && !enabled)}
            />
        </BasicSettingsCard>
    )
}
