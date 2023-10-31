import {BluechipClient, BluechipTxResponse, BroadcastOptions, sendTx} from "../../core";
import {MsgWithdrawDelegatorReward, MsgFundCommunityPool} from "../../bluechip/lib/generated/cosmos/distribution/v1beta1/tx";

export const withdrawDelegatorReward = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorAddress: string,
    options: BroadcastOptions
): Promise<BluechipTxResponse> =>
    Promise.resolve(sendTx(client, '/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', {
        delegatorAddress,
        validatorAddress,
    } as MsgWithdrawDelegatorReward, options))
        .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);

export const fundCommunityPool = (
    client: BluechipClient,
    params: {
        depositor: string,
        amount: { amount: number, denom: 'ubluechip' }[],
    },
    options: BroadcastOptions
) =>
  Promise.resolve(sendTx(client, '/cosmos.distribution.v1beta1.MsgFundCommunityPool', {
    amount: params.amount.map(({amount, denom}) => ({amount: amount.toString(), denom})),
    depositor: params.depositor,
  } as MsgFundCommunityPool, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);
