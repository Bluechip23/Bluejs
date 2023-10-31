import {BluechipClient, BluechipTxResponse, BroadcastOptions, sendTx} from "../../core";
import {MsgBeginRedelegate, MsgDelegate, MsgUndelegate} from "../../bluechip/lib/generated/cosmos/staking/v1beta1/tx";

export const delegate = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorAddress: string,
    amount: number, options: BroadcastOptions
): Promise<BluechipTxResponse> =>
    Promise.resolve(sendTx(client, '/cosmos.staking.v1beta1.MsgDelegate', {
        delegatorAddress,
        validatorAddress,
        amount: {denom: 'ubluechip', amount: amount.toString()},
    } as MsgDelegate, options))
        .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);

export const undelegate = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorAddress: string,
    amount: number,
    options: BroadcastOptions
): Promise<BluechipTxResponse> =>
    Promise.resolve(sendTx(client, '/cosmos.staking.v1beta1.MsgUndelegate', {
        delegatorAddress,
        validatorAddress,
        amount: {denom: 'ubluechip', amount: amount.toString()},
    } as MsgUndelegate, options))
        .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);

export const redelegate = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorSrcAddress: string,
    validatorDstAddress: string,
    amount: number,
    options: BroadcastOptions
): Promise<BluechipTxResponse> =>
    Promise.resolve(sendTx(client, '/cosmos.staking.v1beta1.MsgBeginRedelegate', {
        delegatorAddress,
        validatorSrcAddress,
        validatorDstAddress,
        amount: {denom: 'ubluechip', amount: amount.toString()},
    } as MsgBeginRedelegate, options))
        .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);

