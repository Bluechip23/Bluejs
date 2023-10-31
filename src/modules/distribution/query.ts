import {
  QueryDelegationTotalRewardsResponse
} from '../../bluechip/lib/generated/cosmos/distribution/v1beta1/query';
import {
  DelegationDelegatorReward
} from '../../bluechip/lib/generated/cosmos/distribution/v1beta1/distribution';
import { BluechipClient } from '../../core';
import { BluechipCoin } from '../../shared/types';
import { parseLongCoin, sumBluechipCoins } from '../../shared/parse';

export type BluechipDelegationTotalRewardsResponse = {
    rewards: BluechipDelegationDelegatorReward[],
    total: BluechipCoin[]
}


export type BluechipDelegationDelegatorReward = {
    reward: BluechipCoin[],
    validatorAddress: string,
    totalReward: BluechipCoin
}


export const getDelegationRewards = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorAddress: string
): Promise<BluechipCoin[]> =>
    client.queryClient.distribution.DelegationRewards({
        delegatorAddress,
        validatorAddress
    })
        .then(res => res.rewards ? res.rewards.map(parseLongCoin) : []);


export const getDelegationTotalRewards = (
    client: BluechipClient,
    delegatorAddress: string
): Promise<BluechipDelegationTotalRewardsResponse> =>
    client.queryClient.distribution.DelegationTotalRewards({
        delegatorAddress
    })
        .then(parseQueryDelegationTotalRewardsResponse);


const parseQueryDelegationTotalRewardsResponse = (res: QueryDelegationTotalRewardsResponse): Promise<BluechipDelegationTotalRewardsResponse> =>
    Promise.all(res.rewards.map(parseDelegationDelegatorReward))
        .then(rewards => ({
            rewards,
            total: res.total.map(parseLongCoin)
        }));


const parseDelegationDelegatorReward = (delegatorReward: DelegationDelegatorReward): Promise<BluechipDelegationDelegatorReward> =>
    Promise.resolve(delegatorReward.reward.map(parseLongCoin))
        .then(reward => ({
            reward: reward,
            validatorAddress: delegatorReward.validatorAddress,
            totalReward: sumBluechipCoins(reward)
        }));


