import {BluechipClient, BroadcastOptions, sendTx} from "../../core";

export const pinCid = (client: BluechipClient, cid: string, options: BroadcastOptions) =>
    sendTx(client, '/bluechip.bluechip.storage.MsgPin', {cid, creator: client.address}, options);