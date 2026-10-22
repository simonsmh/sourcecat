"use client"

import { useState } from "react"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SettingsCard } from "@/app/(app)/settings/components/settingsCard"
import { UpsellDialog } from "@/features/billing/upsellDialog"
import { useTranslations } from "@/i18n/I18nProvider"

export function IdentityProviderUpsellCard() {
    const [isUpsellDialogOpen, setIsUpsellDialogOpen] = useState(false)
    const t = useTranslations("settings")

    return (
        <>
            <SettingsCard>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted flex-shrink-0">
                            <Sparkles className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                            <p className="font-medium text-sm">{t("securityPage.ssoUpsell.title")}</p>
                            <p className="text-xs text-muted-foreground">{t("securityPage.ssoUpsell.description")}</p>
                        </div>
                    </div>
                    <Button className="flex-shrink-0" onClick={() => setIsUpsellDialogOpen(true)}>
                        {t("securityPage.upgrade")}
                    </Button>
                </div>
            </SettingsCard>

            <UpsellDialog
                open={isUpsellDialogOpen}
                onOpenChange={setIsUpsellDialogOpen}
                source="sso_settings"
                returnPath="/settings/security"
            />
        </>
    )
}
