import { BookMarkedIcon, LibraryBigIcon, ScanSearchIcon } from "lucide-react";
import { useTranslations } from "@/i18n/I18nProvider";

export const SearchScopeInfoCard = () => {
    const t = useTranslations("chat");
    return (
        <div className="bg-popover border border-border rounded-lg shadow-lg p-4 w-80 max-w-[90vw]">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-border/50">
                <ScanSearchIcon className="h-4 w-4 text-primary" />
                <h4 className="text-sm font-semibold text-popover-foreground">{t("scopeSelector.infoTitle")}</h4>
            </div>
            <div className="text-sm text-popover-foreground leading-relaxed">
                {t("scopeSelector.infoIntro1")}
                {t("scopeSelector.infoIntro2")}
                <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                        <BookMarkedIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span><strong>{t("scopeSelector.infoRepositoryName")}</strong>: {t("scopeSelector.infoRepositoryDesc")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LibraryBigIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span><strong>{t("scopeSelector.infoReposetName")}</strong>: {t("scopeSelector.infoReposetDesc")}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}; 