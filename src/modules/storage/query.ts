import {BluechipClient} from "../../core";
import waitUntil from "async-wait-until";


export const waitForContent = (client: BluechipClient, path: string, waitTime: number = 5000) =>
    waitUntil(
        () => hasContent(client, path),
        {timeout: waitTime},
    );


export const hasContent = (client: BluechipClient, cid: string) =>
    client.queryClient.storage.HasContent({cid})
        .then(x => x.hasContent);