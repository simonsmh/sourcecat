'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { useCallback, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSyntaxGuide } from "./syntaxGuideProvider";
import { CodeSnippet } from "@/app/components/codeSnippet";
import { useTranslations } from "@/i18n/I18nProvider";
import { ExternalLinkIcon, RegexIcon } from "lucide-react";

const LINGUIST_LINK = "https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml";
const CTAGS_LINK = "https://ctags.io/";

export const SyntaxReferenceGuide = () => {
    const t = useTranslations("search");
    const { isOpen, onOpenChanged } = useSyntaxGuide();
    const previousFocusedElement = useRef<HTMLElement | null>(null);

    const openDialog = useCallback(() => {
        previousFocusedElement.current = document.activeElement as HTMLElement;
        onOpenChanged(true);
    }, [onOpenChanged]);

    const closeDialog = useCallback(() => {
        onOpenChanged(false);

        // @note: Without requestAnimationFrame, focus was not being returned
        // to codemirror elements for some reason.
        requestAnimationFrame(() => {
            previousFocusedElement.current?.focus();
        });
    }, [onOpenChanged]);

    const handleOpenChange = useCallback((isOpen: boolean) => {
        if (isOpen) {
            openDialog();
        } else {
            closeDialog();
        }
    }, [closeDialog, openDialog]);

    useHotkeys("mod+/", (event) => {
        event.preventDefault();
        handleOpenChange(!isOpen);
    }, {
        enableOnFormTags: true,
        enableOnContentEditable: true,
        description: "Open Syntax Reference Guide",
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={handleOpenChange}
        >
            <DialogContent
                className="max-h-[80vh] max-w-[700px] overflow-scroll gap-2"
            >
                <DialogHeader>
                    <DialogTitle>{t("syntaxGuide.title")} <Link href="https://github.com/simonsmh/sourcecat/blob/main/docs/docs/features/search/syntax-reference.mdx"><ExternalLinkIcon className="inline w-4 h-4 ml-1 mb-1 text-muted-foreground cursor-pointer" /></Link></DialogTitle>
                    <DialogDescription className="text-sm text-foreground">
                        {t("syntaxGuide.description")}
                    </DialogDescription>
                </DialogHeader>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-0">{t("syntaxGuide.keyword.title")}</h3>
                    <p className="text-sm mb-2 mt-0">
                        {t("syntaxGuide.keyword.introBefore")} <CodeSnippet>{`""`}</CodeSnippet> {t("syntaxGuide.keyword.introAfter")}
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="py-2">{t("syntaxGuide.example")}</TableHead>
                                <TableHead className="py-2">{t("syntaxGuide.explanation")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.keyword.row1")} <CodeSnippet>foo</CodeSnippet></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo bar</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.keyword.row2Before")} <CodeSnippet>foo</CodeSnippet> <b>{t("syntaxGuide.wordAnd")}</b> <CodeSnippet>bar</CodeSnippet></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>{`"foo bar"`}</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.keyword.row3")} <CodeSnippet>foo bar</CodeSnippet></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>{'"foo \\"bar\\""'}</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.matchContaining")} <CodeSnippet>foo &quot;bar&quot;</CodeSnippet> {t("syntaxGuide.keyword.row4After")}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <Separator className="my-4"/>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-0">{t("syntaxGuide.regex.title")}</h3>
                    <p className="text-sm mb-2 mt-0">
                        {t("syntaxGuide.regex.introBefore")} <RegexIcon className="inline w-4 h-4 align-middle mx-0.5 border rounded px-0.5 py-0.5" /> {t("syntaxGuide.regex.introAfter")}
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="py-2">{t("syntaxGuide.example")}</TableHead>
                                <TableHead className="py-2">{t("syntaxGuide.explanation")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.regex.rowPrefix")} <CodeSnippet>/foo/</CodeSnippet></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo.*bar</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.regex.rowPrefix")} <CodeSnippet>/foo.*bar/</CodeSnippet> {t("syntaxGuide.regex.row2Suffix")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>{`^function\\s+\\w+`}</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.regex.rowPrefix")} <CodeSnippet>/^function\s+\w+/</CodeSnippet> {t("syntaxGuide.regex.row3Suffix")}</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>{`"foo bar"`}</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.regex.rowPrefix")} <CodeSnippet>/foo bar/</CodeSnippet>{t("syntaxGuide.regex.row4Suffix")}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>

                <Separator className="my-4"/>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-0">{t("syntaxGuide.filters.title")}</h3>
                    <p className="text-sm mb-2 mt-0">
                        {t("syntaxGuide.filters.introBefore")} <CodeSnippet>-</CodeSnippet> {t("syntaxGuide.filters.introAfter")}
                    </p>

                    <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="py-2">{t("syntaxGuide.prefixHeader")}</TableHead>
                            <TableHead className="py-2">{t("syntaxGuide.descriptionHeader")}</TableHead>
                            <TableHead className="py-2 w-[175px]">{t("syntaxGuide.example")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell className="py-2"><CodeSnippet><Highlight>file:</Highlight></CodeSnippet></TableCell>
                            <TableCell className="py-2">{t("syntaxGuide.filters.fileDesc")}</TableCell>
                            <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.fileTitle1")}
                                    >
                                        <Highlight>file:</Highlight>README
                                    </CodeSnippet>
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.fileTitle2")}
                                    >
                                        <Highlight>file:</Highlight>{`"my file"`}
                                    </CodeSnippet>
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.fileTitle3")}
                                    >
                                        <Highlight>-file:</Highlight>test\.ts$
                                    </CodeSnippet>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="py-2"><CodeSnippet><Highlight>repo:</Highlight></CodeSnippet></TableCell>
                            <TableCell className="py-2">{t("syntaxGuide.filters.repoDesc")}</TableCell>
                            <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.repoTitle1")}
                                    >
                                        <Highlight>repo:</Highlight>linux
                                    </CodeSnippet>
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.repoTitle2")}
                                    >
                                        <Highlight>-repo:</Highlight>^web/.*
                                    </CodeSnippet>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="py-2"><CodeSnippet><Highlight>rev:</Highlight></CodeSnippet></TableCell>
                            <TableCell className="py-2">{t("syntaxGuide.filters.revDescBefore")} <b>{t("syntaxGuide.wordOnly")}</b> {t("syntaxGuide.filters.revDescAfter")}</TableCell>
                            <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.revTitle1")}
                                    >
                                        <Highlight>rev:</Highlight>beta
                                    </CodeSnippet>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="py-2"><CodeSnippet><Highlight>lang:</Highlight></CodeSnippet></TableCell>
                            <TableCell className="py-2">{t("syntaxGuide.filters.langDescBefore")} <Link className="text-blue-500" href={LINGUIST_LINK}>linguist</Link>{t("syntaxGuide.filters.langDescAfter")}</TableCell>
                            <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.langTitle1")}
                                    >
                                        <Highlight>lang:</Highlight>TypeScript
                                    </CodeSnippet>
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.langTitle2")}
                                    >
                                        <Highlight>-lang:</Highlight>YAML
                                    </CodeSnippet>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="py-2"><CodeSnippet><Highlight>sym:</Highlight></CodeSnippet></TableCell>
                            <TableCell className="py-2">{t("syntaxGuide.filters.symDescBefore")} <Link className="text-blue-500" href={CTAGS_LINK}>universal ctags</Link> {t("syntaxGuide.filters.symDescAfter")}</TableCell>
                            <TableCell className="py-2">
                                <div className="flex flex-col gap-1">
                                    <CodeSnippet
                                        title={t("syntaxGuide.filters.symTitle1")}
                                    >
                                        <Highlight>sym:</Highlight>\bmain\b
                                    </CodeSnippet>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                    </Table>
                </div>

                <Separator className="my-4"/>

                <div>
                    <h3 className="text-lg font-semibold mt-4 mb-0">{t("syntaxGuide.boolean.title")}</h3>
                    <p className="text-sm mb-2 mt-0">
                        {t("syntaxGuide.boolean.intro1")} <CodeSnippet>or</CodeSnippet> {t("syntaxGuide.boolean.intro2")} <CodeSnippet>()</CodeSnippet> {t("syntaxGuide.boolean.intro3")} <CodeSnippet>-</CodeSnippet> {t("syntaxGuide.boolean.intro4")}
                    </p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="py-2">{t("syntaxGuide.example")}</TableHead>
                                <TableHead className="py-2">{t("syntaxGuide.explanation")}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo <Highlight>or</Highlight> bar</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.matchContaining")} <CodeSnippet>foo</CodeSnippet> <b>{t("syntaxGuide.wordOr")}</b> <CodeSnippet>bar</CodeSnippet></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>foo (bar <Highlight>or</Highlight> baz)</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.matchContaining")} <CodeSnippet>foo</CodeSnippet> <b>{t("syntaxGuide.wordAnd")}</b> {t("syntaxGuide.wordEither")} <CodeSnippet>bar</CodeSnippet> <b>{t("syntaxGuide.wordOr")}</b> <CodeSnippet>baz</CodeSnippet>.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell className="py-2"><CodeSnippet>-(foo) bar</CodeSnippet></TableCell>
                                <TableCell className="py-2">{t("syntaxGuide.matchContaining")} <CodeSnippet>bar</CodeSnippet> <b>{t("syntaxGuide.wordAndNot")}</b> <CodeSnippet>foo</CodeSnippet>.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}

const Highlight = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className="text-highlight">
            {children}
        </span>
    )
}
