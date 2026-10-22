import { BookOpenIcon, PlusIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "@/i18n/I18nProvider";

export function SkillsEmptyState({ onCreate }: { onCreate: () => void }) {
    const t = useTranslations("settings");
    return (
        <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
                <BookOpenIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="mb-1 text-sm font-medium text-foreground">{t("skillsPage.noSkillSelected")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
                {t("skillsPage.emptyDescription")}
            </p>
            <Button variant="outline" className="mt-4" onClick={onCreate}>
                <PlusIcon className="mr-2 h-4 w-4" />
                {t("skillsPage.createSkill")}
            </Button>
        </div>
    );
}
