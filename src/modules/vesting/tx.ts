import {BluechipClient, BluechipTxResponse, BroadcastOptions, sendTx} from "../../core";
import {MsgCreateVestingAccount} from "../../bluechip/lib/generated/cosmos/vesting/v1beta1/tx";
import {Some} from "monet";

const Long = require('long');

type BluechipCreateVestingAccountParams = {
        fromAddress: string,
        toAddress: string,
        amount: {denom: 'ubluechip' | 'uelt' | 'ug4', amount: number | string}[],
        endTime: number | string,
        delayed: boolean,
}

export const createVestingAccount = (
    client: BluechipClient,
    params: BluechipCreateVestingAccountParams,
    options: BroadcastOptions
): Promise<BluechipTxResponse> =>
    Promise.resolve(
        sendTx(
            client,
            '/cosmos.vesting.v1beta1.MsgCreateVestingAccount',
            parseBluechipCreateVestingAccountParamsToMsgCreateVestingAccount(params),
            options
        ))
        .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


const parseBluechipCreateVestingAccountParamsToMsgCreateVestingAccount = (params: BluechipCreateVestingAccountParams): MsgCreateVestingAccount =>
    Some(
        params.amount.reduce<{ denom: string; amount: string }[]>(
            (acc, cur) => {
                    acc.push({ denom: cur.denom, amount: cur.amount.toString() });
                    return acc;
            },
            []
        )
    )
        .map((amount) => ({
                fromAddress: params.fromAddress,
                toAddress: params.toAddress,
                amount: amount,
                endTime: new Long(params.endTime),
                delayed: params.delayed,
        }))
        .join();
