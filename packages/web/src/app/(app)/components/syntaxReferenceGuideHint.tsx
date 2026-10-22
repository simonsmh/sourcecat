'use client';

import { useSyntaxGuide } from "./syntaxGuideProvider";
import { KeyboardShortcutHint } from "../../components/keyboardShortcutHint";
import { useTranslations } from "@/i18n/I18nProvider";

export const SyntaxReferenceGuideHint = () => {
    const t = useTranslations("search");
    const { isOpen, onOpenChanged } = useSyntaxGuide();

    return (
        <div
            className="text-sm cursor-pointer"
            onClick={() => onOpenChanged(!isOpen)}
        >
            <span className="dark:text-gray-300">{t("syntaxGuide.hintLabel")}{" "}</span><KeyboardShortcutHint shortcut="mod" /> <KeyboardShortcutHint shortcut="/" />
        </div>
    )
}