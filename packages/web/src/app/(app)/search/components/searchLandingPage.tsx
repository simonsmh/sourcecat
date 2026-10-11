import { SourcecatLogo } from "@/app/components/sourcecatLogo"
import { Separator } from "@/components/ui/separator"
import { SyntaxReferenceGuideHint } from "../../components/syntaxReferenceGuideHint"
import Link from "next/link"
import { SearchBar } from "../../components/searchBar"
import { SearchModeSelector } from "../../components/searchModeSelector"
import { getRepos } from "@/actions"
import { ServiceErrorException } from "@/lib/serviceError"
import { isServiceError } from "@/lib/utils"
import { getTranslations } from "@/i18n/server"

export interface SearchLandingPageProps {
    isSearchAssistSupported: boolean;
    showLoginWall: boolean;
}

export const SearchLandingPage = async ({
    isSearchAssistSupported,
    showLoginWall,
}: SearchLandingPageProps) => {
    const t = await getTranslations("search");
    const carouselRepos = await getRepos({
        where: {
            indexedAt: {
                not: null,
            },
        },
        take: 10,
    });

    if (isServiceError(carouselRepos)) throw new ServiceErrorException(carouselRepos);

    return (
        <div className="flex flex-col items-center overflow-hidden">
            <div className="flex flex-col justify-center items-center mt-8 mb-8 md:mt-16 w-full px-5">
                <div className="max-h-44 w-auto">
                    <SourcecatLogo
                        className="h-18 md:h-40 w-auto"
                    />
                </div>
                <div className="mt-4 w-full max-w-[800px] border rounded-md shadow-sm">
                    <SearchBar
                        autoFocus={true}
                        className="border-none pt-0.5 pb-0"
                        isSearchAssistSupported={isSearchAssistSupported}
                        showLoginWall={showLoginWall}
                    />
                    <Separator />
                    <div className="w-full flex flex-row items-center bg-accent rounded-b-md px-2">
                        <SearchModeSelector
                            searchMode="precise"
                            className="ml-auto"
                        />
                    </div>
                </div>

                <div className="flex flex-col items-center w-fit gap-6 mt-8">
                    <span className="font-semibold">{t("howToSearch")}</span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <HowToSection
                            title={t("searchInFilesOrPaths")}
                        >
                            <QueryExample>
                                <Query query="test todo">test todo</Query> <QueryExplanation>{t("queryBoth", { a: "test", b: "todo" })}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="test or todo">test <Highlight>or</Highlight> todo</Query> <QueryExplanation>{t("queryEither", { a: "test", b: "todo" })}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query={`"exit boot"`}>{`"exit boot"`}</Query> <QueryExplanation>{t("queryExactMatch")}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="TODO" isCaseSensitivityEnabled={true}>TODO</Query> <QueryExplanation>{t("queryCaseSensitive")}</QueryExplanation>
                            </QueryExample>
                        </HowToSection>
                        <HowToSection
                            title={t("filterResults")}
                        >
                            <QueryExample>
                                <Query query="file:README setup"><Highlight>file:</Highlight>README setup</Query> <QueryExplanation>{t("queryByFilename")}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="repo:torvalds/linux test"><Highlight>repo:</Highlight>torvalds/linux test</Query> <QueryExplanation>{t("queryByRepo")}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="lang:TypeScript"><Highlight>lang:</Highlight>TypeScript</Query> <QueryExplanation>{t("queryByLanguage")}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="rev:HEAD"><Highlight>rev:</Highlight>HEAD</Query> <QueryExplanation>{t("queryByBranchOrTag")}</QueryExplanation>
                            </QueryExample>
                        </HowToSection>
                        <HowToSection
                            title={t("advanced")}
                        >
                            <QueryExample>
                                <Query query="file:\.py$"><Highlight>file:</Highlight>{`\\.py$`}</Query> <QueryExplanation>{t("queryFilesEndWith", { suffix: '".py"' })}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="sym:main"><Highlight>sym:</Highlight>main</Query> <QueryExplanation>{t("querySymbolsNamed", { name: '"main"' })}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="todo -lang:c">todo <Highlight>-lang:c</Highlight></Query> <QueryExplanation>{t("queryNegateFilter")}</QueryExplanation>
                            </QueryExample>
                            <QueryExample>
                                <Query query="content:README"><Highlight>content:</Highlight>README</Query> <QueryExplanation>{t("querySearchContentOnly")}</QueryExplanation>
                            </QueryExample>
                        </HowToSection>
                    </div>
                    <SyntaxReferenceGuideHint />
                </div>
            </div>
        </div>
    )
}

const HowToSection = ({ title, children }: { title: string, children: React.ReactNode }) => {
    return (
        <div className="flex flex-col gap-1">
            <span className="dark:text-gray-300 text-sm mb-2 underline">{title}</span>
            {children}
        </div>
    )

}

const Highlight = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className="text-highlight">
            {children}
        </span>
    )
}

const QueryExample = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className="text-sm font-mono">
            {children}
        </span>
    )
}

const QueryExplanation = ({ children }: { children: React.ReactNode }) => {
    return (
        <span className="text-gray-500 dark:text-gray-400 ml-3">
            {children}
        </span>
    )
}

const Query = ({ query, children, isCaseSensitivityEnabled = false }: { query: string, children: React.ReactNode, isCaseSensitivityEnabled?: boolean }) => {
    return (
        <Link
            href={`/search?query=${query}${isCaseSensitivityEnabled ? "&isCaseSensitivityEnabled=true" : ""}`}
            className="cursor-pointer hover:underline"
        >
            {children}
        </Link>
    )
}
