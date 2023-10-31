import {BluechipClient, BroadcastOptions, sendTx} from "../../core";
import {MsgSend} from "../../bluechip/lib/generated/cosmos/bank/v1beta1/tx";

export const send = (client: BluechipClient, toAddress: string, amount: number, options: BroadcastOptions, denom: string = "ubluechip") =>
    sendTx(client, '/cosmos.bank.v1beta1.MsgSend', {
        toAddress: toAddress,
        amount: [{denom, amount: amount.toString()}],
        fromAddress: client.address
    } as MsgSend, options);