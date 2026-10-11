import { sourcecat_pr_payload, sourcecat_diff_review, sourcecat_file_diff_review, sourcecat_context } from "@/features/agents/review-agent/types";
import { generateDiffReviewPrompt } from "@/features/agents/review-agent/nodes/generateDiffReviewPrompt";
import { invokeDiffReviewLlm } from "@/features/agents/review-agent/nodes/invokeDiffReviewLlm";
import { fetchFileContent } from "@/features/agents/review-agent/nodes/fetchFileContent";
import { createLogger } from "@sourcecat/shared";

const logger = createLogger('generate-pr-review');

export const generatePrReviews = async (reviewAgentLogFileName: string | undefined, pr_payload: sourcecat_pr_payload, rules: string[]): Promise<sourcecat_file_diff_review[]> => {
    logger.debug("Executing generate_pr_reviews");

    const file_diff_reviews: sourcecat_file_diff_review[] = [];
    for (const file_diff of pr_payload.file_diffs) {
        const reviews: sourcecat_diff_review[] = [];

        for (const diff of file_diff.diffs) {
            try {
                const fileContentContext = await fetchFileContent(pr_payload, file_diff.to);
                const context: sourcecat_context[] = [
                    {
                        type: "pr_title",
                        description: "The title of the pull request",
                        context: pr_payload.title,
                    },
                    {
                        type: "pr_description",
                        description: "The description of the pull request",
                        context: pr_payload.description,
                    },
                    fileContentContext,
                ];

                const prompt = await generateDiffReviewPrompt(diff, context, rules);
                
                const diffReview = await invokeDiffReviewLlm(reviewAgentLogFileName, prompt);
                reviews.push(...diffReview.reviews);
            } catch (error) {
                logger.error(`Error generating review for ${file_diff.to}: ${error}`);
            }
        }
        
        if (reviews.length > 0) {
            file_diff_reviews.push({
                filename: file_diff.to,
                oldFilename: file_diff.from,
                reviews: reviews,
            });
        }
    }

    logger.debug("Completed generate_pr_reviews");
    return file_diff_reviews;
}