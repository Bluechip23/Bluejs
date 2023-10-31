import { BluechipClient, BluechipTxResponse, BroadcastOptions, sendTx } from '../../core';
import {
  MsgSubmitProposal,
  MsgVote,
  MsgVoteWeighted,
  MsgDeposit
} from '../../bluechip/lib/generated/cosmos/gov/v1beta1/tx';
import { VoteOption, WeightedVoteOption } from '../../bluechip/lib/generated/cosmos/gov/v1beta1/gov';
import { TextProposal } from 'cosmjs-types/cosmos/gov/v1beta1/gov';
import { ParamChange, ParameterChangeProposal } from 'cosmjs-types/cosmos/params/v1beta1/params';
import { CommunityPoolSpendProposal } from 'cosmjs-types/cosmos/distribution/v1beta1/distribution';
import { encodeSoftwareUpgradeProposal } from '../upgrade';
import { parseStringToLong, scaleTo18 } from '../../shared/parse';


export type BluechipWeightedVoteOption = {
  option: VoteOption;
  weight: number;
}

export const submitTextProposal = (
  client: BluechipClient,
  params: {
    title: string,
    description: string,
    initialDeposit: {amount: number, denom: 'ubluechip'}[]
    proposer: string,
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgSubmitProposal', {
    content: {
      typeUrl: '/cosmos.gov.v1beta1.TextProposal',
      value: TextProposal.encode({
        title: params.title,
        description: params.description,
      }).finish()
    },
    proposer: params.proposer,
    initialDeposit: params.initialDeposit.map(({amount, denom}) => ({amount: amount.toString(), denom})),
  } as MsgSubmitProposal, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


export const submitSoftwareUpgradeProposal = (
  client: BluechipClient,
  params: {
    title: string,
    description: string,
    plan?: {
      name: string,
      height: number,
      info: string,
    },
    initialDeposit: {amount: number, denom: 'ubluechip'}[]
    proposer: string,
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgSubmitProposal', {
    content: {
      typeUrl: '/cosmos.upgrade.v1beta1.SoftwareUpgradeProposal',
      value: encodeSoftwareUpgradeProposal({
        title: params.title,
        description: params.description,
        plan: params.plan,
      })
    },
    proposer: params.proposer,
    initialDeposit: params.initialDeposit.map(({amount, denom}) => ({amount: amount.toString(), denom})),
  } as MsgSubmitProposal, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


export const submitParameterChangeProposal = (
  client: BluechipClient,
  params: {
    title: string,
    description: string,
    changes: ParamChange[],
    initialDeposit: {amount: number, denom: 'ubluechip'}[]
    proposer: string,
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgSubmitProposal', {
    content: {
      typeUrl: '/cosmos.params.v1beta1.ParameterChangeProposal',
      value: ParameterChangeProposal.encode({
        title: params.title,
        description: params.description,
        changes: params.changes,
      }).finish()
    },
    proposer: params.proposer,
    initialDeposit: params.initialDeposit.map(({amount, denom}) => ({amount: amount.toString(), denom})),
  } as MsgSubmitProposal, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


export const submitCommunityPoolSpendProposal = (
  client: BluechipClient,
  params: {
    title: string,
    description: string,
    recipient: string;
    amount: {amount: number, denom: 'ubluechip' | 'ug4' | 'uelt'}[];
    initialDeposit: {amount: number, denom: 'ubluechip'}[]
    proposer: string,
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgSubmitProposal', {
    content: {
      typeUrl: '/cosmos.distribution.v1beta1.CommunityPoolSpendProposal',
      value: CommunityPoolSpendProposal.encode({
        title: params.title,
        description: params.description,
        recipient: params.recipient,
        amount: params.amount.map(({amount, denom}) => ({amount: amount.toString(), denom}))
      }).finish()
    },
    proposer: params.proposer,
    initialDeposit: params.initialDeposit.map(({amount, denom}) => ({amount: amount.toString(), denom})),
  } as MsgSubmitProposal, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


export const vote = (
  client: BluechipClient,
  params: {
    proposalId: string,
    voter: string,
    option: VoteOption
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgVote', {
    proposalId: parseStringToLong(params.proposalId),
    voter: params.voter,
    option: params.option,
  } as MsgVote, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);


export const voteWithWeights = (
  client: BluechipClient,
  params: {
    proposalId: string,
    voter: string,
    options: BluechipWeightedVoteOption[]
  },
  options: BroadcastOptions
): Promise<BluechipTxResponse> =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgVoteWeighted', {
    proposalId: parseStringToLong(params.proposalId),
    voter: params.voter,
    options: params.options.map(parseBluechipWeightedVoteOption),
  } as MsgVoteWeighted, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);

const parseBluechipWeightedVoteOption = (vote: BluechipWeightedVoteOption) => ({
  ...vote,
  weight: scaleTo18(vote.weight)
});


export const depositToProposal = (
  client: BluechipClient,
  params: {
    proposalId: string;
    depositor: string;
    amount: {amount: number, denom: 'ubluechip'}[];
  },
  options: BroadcastOptions
) =>
  Promise.resolve(sendTx(client, '/cosmos.gov.v1beta1.MsgDeposit', {
    proposalId: parseStringToLong(params.proposalId),
    depositor: params.depositor,
    amount: params.amount.map(({amount, denom}) => ({amount: amount.toString(), denom})),
  } as MsgDeposit, options))
    .then(res => res ? res as BluechipTxResponse : {} as BluechipTxResponse);
