import { redirect } from "next/navigation";
import { env } from "@sourcecat/shared";

export default async function AskGHLayout(props: {
    children: React.ReactNode;
}) {
    if (env.EXPERIMENT_ASK_GH_ENABLED !== 'true') {
        redirect('/');
    }

    return <>{props.children}</>;
}
