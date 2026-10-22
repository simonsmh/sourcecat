import { Card, CardContent } from "@/components/ui/card";
import { getLinkedAccounts } from "@/ee/features/sso/actions";
import { isServiceError } from "@/lib/utils";
import { LogoutEscapeHatch } from "@/app/components/logoutEscapeHatch";
import { ShieldCheck } from "lucide-react";
import { LinkedAccountProviderCard } from "@/ee/features/sso/components/linkedAccountProviderCard";
import { getTranslations } from "@/i18n/server";

export default async function LinkedAccountsPage() {
    const t = await getTranslations("settings");
    const linkedAccounts = await getLinkedAccounts();
    if (isServiceError(linkedAccounts)) {
        return <div className="min-h-screen flex flex-col items-center justify-center p-6">
            <LogoutEscapeHatch className="absolute top-0 right-0 p-6" />
            <div className="bg-red-50 border border-red-200 rounded-md p-6 max-w-md w-full text-center">
                <h2 className="text-lg font-semibold text-red-800 mb-2">{t("linkedAccountsPage.errorTitle")}</h2>
                <p className="text-red-700 mb-1">
                    {typeof linkedAccounts.message === 'string'
                        ? linkedAccounts.message
                        : t("linkedAccountsPage.errorFallback")}
                </p>
            </div>
        </div>
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium">{t("linkedAccountsPage.title")}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    {t("linkedAccountsPage.description")}
                </p>
            </div>

            {linkedAccounts.length === 0 ? (
                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-muted p-3 mb-4">
                            <ShieldCheck className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm font-medium text-foreground mb-1">{t("linkedAccountsPage.noAccounts")}</p>
                        <p className="text-sm text-muted-foreground max-w-sm">
                            {t("linkedAccountsPage.noAccountsDescription")}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {linkedAccounts
                        .sort((a, b) => (b.required ? 1 : 0) - (a.required ? 1 : 0))
                        .map((account) => (
                            <LinkedAccountProviderCard
                                key={account.providerId}
                                linkedAccount={account}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}
