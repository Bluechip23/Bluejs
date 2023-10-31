import {BluechipClient, BroadcastOptions, sendTx} from "../../core";


export const setGasTaxBp = (client: BluechipClient, bp: number, options: BroadcastOptions) =>
    sendTx(client, '/bluechip.bluechip.tax.MsgSetGasTaxBp', {bp, creator: client.address}, options);

export const setTransferTaxBp = (client: BluechipClient, bp: number, options: BroadcastOptions) =>
    sendTx(client, '/bluechip.bluechip.tax.MsgSetTransferTaxBp', {bp, creator: client.address}, options);

export const setTaxCollector = (client: BluechipClient, taxCollector: string, options: BroadcastOptions) =>
    sendTx(client, '/bluechip.bluechip.tax.MsgSetTaxCollector', {taxCollector, creator: client.address}, options);