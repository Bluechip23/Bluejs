import {BluechipClient} from "./sdk";

export const getTx = (client: BluechipClient, hash: string) =>
    client.queryClient.tx.GetTx({hash});


