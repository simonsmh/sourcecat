import { BLAME_AGE_BG_CLASSES } from "./blameAgeColors";
import { cn } from "@/lib/utils";
import { useTranslations } from "@/i18n/I18nProvider";

export const BlameAgeLegend = () => {
    const t = useTranslations("codeNav");
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{t("preview.older")}</span>
            <div className="flex items-center gap-px">
                {BLAME_AGE_BG_CLASSES.map((bg, i) => (
                    <div
                        key={i}
                        className={cn('h-2 w-2', bg)}
                    />
                ))}
            </div>
            <span>{t("preview.newer")}</span>
        </div>
    );
};
