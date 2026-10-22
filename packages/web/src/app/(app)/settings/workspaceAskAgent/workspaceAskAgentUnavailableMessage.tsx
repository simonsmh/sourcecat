import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CableIcon } from "lucide-react";
import { getTranslations } from "@/i18n/server";

export async function WorkspaceAskAgentUnavailableMessage() {
    const t = await getTranslations("settings");
    return (
        <div className="flex items-center justify-center min-h-[60vh] py-12">
            <Card className="w-full max-w-lg bg-card border-border p-2">
                <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 rounded-full bg-muted">
                            <CableIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-card-foreground">
                        {t("askPage.unavailable.title")}
                    </CardTitle>
                    <CardDescription className="text-muted-foreground mt-2">
                        {t("askPage.unavailable.description")}
                    </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                    <p className="text-sm text-muted-foreground">
                        {t("askPage.unavailable.body")}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
