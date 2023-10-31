import { BluechipClient } from './sdk';
import { EncodeObject, Registry } from '@cosmjs/proto-signing';
import { Deferred, newDeferred } from '../utils/Deferred';
import { Left, Right, Some } from 'monet';
import { passThrough } from 'promise-passthrough';
import { identity } from 'lodash';
import { MsgSend } from '../bluechip/lib/generated/cosmos/bank/v1beta1/tx';

import {
    MsgBeginRedelegate,
    MsgDelegate,
    MsgUndelegate
} from '../bluechip/lib/generated/cosmos/staking/v1beta1/tx';
import {
    MsgFundCommunityPool,
    MsgWithdrawDelegatorReward
} from '../bluechip/lib/generated/cosmos/distribution/v1beta1/tx';
import { MsgExec, MsgGrant, MsgRevoke } from '../bluechip/lib/generated/cosmos/authz/v1beta1/tx';
import { MsgCreateVestingAccount } from '../bluechip/lib/generated/cosmos/vesting/v1beta1/tx';
import {
    MsgDeposit,
    MsgSubmitProposal,
    MsgVote,
    MsgVoteWeighted
} from '../bluechip/lib/generated/cosmos/gov/v1beta1/tx';
import { DeliverTxResponse } from '@cosmjs/stargate';
import { toHex } from '@cosmjs/encoding';
import { TxRaw } from '../bluechip/lib/generated/cosmos/tx/v1beta1/tx';

interface MsgQueueItem<T> {
    msg: EncodeObject;
    options: BroadcastOptions;
    deferred: Deferred<T>;
}

type MsgQueue = MsgQueueItem<unknown>[] | undefined;

let msgQueue: MsgQueue;

export interface BroadcastMode {
    async: (client: BluechipClient, msgs: EncodeObject[], options: BroadcastOptions) => Promise<string>
    sync: (client: BluechipClient, msgs: EncodeObject[], options: BroadcastOptions) => Promise<DeliverTxResponse>
}

const getDefaultBroadcastMode = () => ({
    async: broadcastTxAsync,
    sync: broadcastTx
})

export type BluechipTxResponse = DeliverTxResponse;

export const withTransaction = (client: BluechipClient, fn: () => unknown) => {
    startTransaction();
    fn();
    const queue: MsgQueue = msgQueue || [];
    msgQueue = undefined;
    return endTransaction(queue, client)
        .then(passThrough(response => queue.map((it, idx) =>
            it.deferred.resolve({...response, rawLog: response.rawLog?.[idx]})
        )))

};

const startTransaction = () => msgQueue = [];
const endTransaction = (queue: MsgQueue, client: BluechipClient) => {
    return broadcastTx(client, (queue || []).map(it => it.msg), combineOptions(queue))


    function combineOptions(queue: MsgQueue) {
        return (queue || []).reduce((options, item) => ({
            ...options,
            maxGas: options.maxGas + item.options.maxGas,
            gasPrice: item.options.gasPrice
        }), {maxGas: 0} as BroadcastOptions)
    }
};


export const registerMessages = (registry: Registry) => {
    registry.register('/cosmos.bank.v1beta1.MsgSend', MsgSend)
    registry.register('/cosmos.staking.v1beta1.MsgDelegate', MsgDelegate)
    registry.register('/cosmos.staking.v1beta1.MsgUndelegate', MsgUndelegate)
    registry.register('/cosmos.staking.v1beta1.MsgBeginRedelegate', MsgBeginRedelegate)
    registry.register('/cosmos.distribution.v1beta1.MsgWithdrawDelegatorReward', MsgWithdrawDelegatorReward)
    registry.register('/cosmos.distribution.v1beta1.MsgFundCommunityPool', MsgFundCommunityPool)
    registry.register('/cosmos.authz.v1beta1.MsgGrant', MsgGrant)
    registry.register('/cosmos.authz.v1beta1.MsgExec', MsgExec)
    registry.register('/cosmos.authz.v1beta1.MsgRevoke', MsgRevoke)
    registry.register('/cosmos.vesting.v1beta1.MsgCreateVestingAccount', MsgCreateVestingAccount)
    registry.register('/cosmos.gov.v1beta1.MsgSubmitProposal', MsgSubmitProposal)
    registry.register('/cosmos.gov.v1beta1.MsgVote', MsgVote)
    registry.register('/cosmos.gov.v1beta1.MsgVoteWeighted', MsgVoteWeighted)
    registry.register('/cosmos.gov.v1beta1.MsgDeposit', MsgDeposit)

    return registry
};

export interface BroadcastOptions {
    gasPrice: number,
    maxGas: number,
    mode?: 'async' | 'sync',
    memo?: string
}

const queueMessage = (msg: EncodeObject, options: BroadcastOptions) =>
    Some<MsgQueueItem<unknown>>({
        msg, options, deferred: newDeferred()
    })
        .map(passThrough(item => msgQueue?.push(item)));


export const sendTx = <T>(client: BluechipClient, type: string, msg: T, options: BroadcastOptions, mode: BroadcastMode = getDefaultBroadcastMode()) =>
    Right(msg)
        .map(msg => ({
            typeUrl: type,
            value: msg
        } as EncodeObject))
        .bind(msg => msgQueue ? Left(msg) : Right(msg))
        .map(msg => options.mode ? mode[options.mode](client, [msg as EncodeObject], options) : mode['sync'](client, [msg as EncodeObject], options))
        .leftMap(msg => queueMessage(msg as EncodeObject, options))
        .cata(identity, identity);

const broadcastTx = <T>(client: BluechipClient, msgs: EncodeObject[], options: BroadcastOptions): Promise<DeliverTxResponse> =>
    client.sgClient.signAndBroadcast(
        client.address,
        msgs,
        {
            gas: options.maxGas.toFixed(0), amount: [{
                denom: 'ubluechip',
                amount: (options.gasPrice * options.maxGas).toFixed(0)
            }]
        },
        options.memo)
        .then(response => ({
            ...response,
            rawLog: tryJson(response.rawLog)
        }));

const broadcastTxAsync = <T>(client: BluechipClient, msgs: EncodeObject[], options: BroadcastOptions): Promise<string> =>
    client.sgClient.sign(
        client.address,
        msgs,
        {
            gas: options.maxGas.toFixed(0), amount: [{
                denom: 'ubluechip',
                amount: (options.gasPrice * options.maxGas).toFixed(0)
            }]
        },
        options.memo || ""
    )
        .then(txRaw => TxRaw.encode(txRaw).finish())
        .then(txBytes =>
            client.tmClient.broadcastTxAsync({
                tx: txBytes
            }))
        .then(({hash}) => toHex(hash).toUpperCase());

const tryJson = (s: string = '') => {
    try {
        return JSON.parse(s)
    } catch (e) {
        return s
    }
};
