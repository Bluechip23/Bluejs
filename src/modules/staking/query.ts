import { BluechipClient } from '../../core';
import {
    PageRequest,
    PageResponse
} from '../../bluechip/lib/generated/cosmos/base/query/v1beta1/pagination';
import {
    Delegation,
    DelegationResponse,
    UnbondingDelegation,
    UnbondingDelegationEntry,
    Validator
} from '../../bluechip/lib/generated/cosmos/staking/v1beta1/staking';
import { Coin } from '@cosmjs/proto-signing';
import {
    QueryDelegatorDelegationsResponse,
    QueryDelegatorUnbondingDelegationsResponse,
    QueryValidatorsResponse
} from '../../bluechip/lib/generated/cosmos/staking/v1beta1/query';
import {
    BluechipPageRequest,
    defaultPaginationOptions,
    defaultPaginationResponse
} from '../../shared/pagination';
import { BluechipCoin } from '../../shared/types';
import { parseDecTypeToNumber, parseNumToLong } from '../../shared/parse';

export type BluechipDelegatorUnbondingDelegationsResponse = {
    unbondingDelegations: BluechipUnbondingDelegation[],
    pagination: PageResponse,
}

export type BluechipUnbondingDelegation = {
    delegatorAddress: string,
    validatorAddress: string,
    entries: BluechipUnbondingDelegationEntry[],
    totalBalance: number
}

export type BluechipUnbondingDelegationEntry = {
    creationHeight: number,
    completionTime: Date,
    initialBalance: number,
    balance: number
}


export type BluechipDelegatorDelegationsResponse = {
    pagination: PageResponse,
    delegations: BluechipDelegationResponse[]
}

export type BluechipDelegationResponse = {
    delegation: BluechipDelegation,
    balance: BluechipCoin
}

export type BluechipDelegation = {
    validatorAddress: string,
    delegatorAddress: string,
    shares: number
}

export type BluechipValidatorsResponse = {
    pagination: PageResponse,
    validators: BluechipValidator[]
}

export type BluechipValidator = {
    operatorAddress: string,
    description: {
        moniker: string,
        details: string,
        website: string,
        securityContact: string,
    },
    commission: {
        commissionRates: {
            rate: number,
            maxRate: number,
            maxChangeRate: number,
        },
        updateTime: Date
    },
    minSelfDelegation: number,
    delegatorShares: number,
    jailed: boolean
}


export const getDelegatorDelegations = (
    client: BluechipClient,
    delegatorAddress: string,
    options: BluechipPageRequest = defaultPaginationOptions()
): Promise<BluechipDelegatorDelegationsResponse> =>
    client.queryClient.staking.DelegatorDelegations({
        delegatorAddr: delegatorAddress,
        pagination: {
            key: options.key,
            offset: parseNumToLong(options.offset),
            limit: parseNumToLong(options.limit),
            countTotal: options.countTotal,
            reverse: options.reverse
        } as PageRequest
    })
        .then(parseQueryDelegatorDelegationsResponse);


export const getDelegation = (
    client: BluechipClient,
    delegatorAddress: string,
    validatorAddress: string
): Promise<BluechipDelegationResponse> =>
    client.queryClient.staking.Delegation({
        delegatorAddr: delegatorAddress,
        validatorAddr: validatorAddress
    })
        .then(res => res.delegationResponse ? parseDelegationResponse(res.delegationResponse) : {
            delegation: {
                validatorAddress,
                delegatorAddress,
                shares: 0
            },
            balance: {
                denom: 'ubluechip',
                amount: 0
            }
        } as BluechipDelegationResponse)
        .catch(() => ({
            delegation: {
                validatorAddress,
                delegatorAddress,
                shares: 0
            },
            balance: {
                denom: 'ubluechip',
                amount: 0
            }
        }) as BluechipDelegationResponse);


export const getDelegatorUnbondingDelegations = (
    client: BluechipClient,
    delegatorAddress: string,
    options: BluechipPageRequest = defaultPaginationOptions()
): Promise<BluechipDelegatorUnbondingDelegationsResponse> =>
    client.queryClient.staking.DelegatorUnbondingDelegations({
        delegatorAddr: delegatorAddress,
        pagination: {
            key: options.key,
            offset: parseNumToLong(options.offset),
            limit: parseNumToLong(options.limit),
            countTotal: options.countTotal,
            reverse: options.reverse
        } as PageRequest
    })
        .then(parseQueryDelegatorUnbondingDelegationsResponse);


export const getValidatorsInfo = (
    client: BluechipClient,
    status: 'BOND_STATUS_UNBONDED' | 'BOND_STATUS_UNBONDING' | 'BOND_STATUS_BONDED' = 'BOND_STATUS_BONDED',
    options: BluechipPageRequest = defaultPaginationOptions()
): Promise<BluechipValidatorsResponse> =>
    client.queryClient.staking.Validators({
        status,
        pagination: {
            key: options.key,
            offset: parseNumToLong(options.offset),
            limit: parseNumToLong(options.limit),
            countTotal: options.countTotal,
            reverse: options.reverse
        } as PageRequest
    })
        .then(parseQueryValidatorsResponse);


const parseQueryDelegatorDelegationsResponse = (res: QueryDelegatorDelegationsResponse): Promise<BluechipDelegatorDelegationsResponse> =>
    Promise.resolve(res.delegationResponses.map(parseDelegationResponse))
        .then(delegations => ({
            pagination: res.pagination ? res.pagination : defaultPaginationResponse(),
            delegations,
        }));


const parseDelegationResponse = (res: DelegationResponse): BluechipDelegationResponse => ({
    delegation: res.delegation ? parseDelegation(res.delegation) : {
        validatorAddress: '',
        delegatorAddress: '',
        shares: 0
    },
    balance: res.balance ? parseCoin(res.balance) : {denom: 'ubluechip', amount: 0}
});


const parseDelegation = (delegation: Delegation): BluechipDelegation => ({
    validatorAddress: delegation.validatorAddress,
    delegatorAddress: delegation.delegatorAddress,
    shares: parseDecTypeToNumber(delegation.shares)
});


const parseCoin = (coin: Coin): BluechipCoin => ({denom: 'ubluechip', amount: Number(coin.amount)});


const parseQueryValidatorsResponse = (res: QueryValidatorsResponse): BluechipValidatorsResponse => ({
    pagination: res.pagination ? res.pagination : defaultPaginationResponse(),
    validators: res.validators ? res.validators.map(parseValidator) : []
});


const parseValidator = (validator: Validator) => ({
    operatorAddress: validator.operatorAddress,
    description: {
        moniker: validator.description?.moniker || '',
        details: validator.description?.details || '',
        website: validator.description?.website || '',
        securityContact: validator.description?.securityContact || '',
    },
    commission: {
        commissionRates: {
            rate: parseDecTypeToNumber(validator.commission?.commissionRates?.rate || '0'),
            maxRate: parseDecTypeToNumber(validator.commission?.commissionRates?.maxRate || '0'),
            maxChangeRate: parseDecTypeToNumber(validator.commission?.commissionRates?.maxChangeRate || '0'),
        },
        updateTime: validator.commission?.updateTime || new Date(0)
    },
    minSelfDelegation: Number(validator.minSelfDelegation),
    delegatorShares: parseDecTypeToNumber(validator.delegatorShares),
    jailed: validator.jailed
});


const parseQueryDelegatorUnbondingDelegationsResponse = (
    res: QueryDelegatorUnbondingDelegationsResponse
): BluechipDelegatorUnbondingDelegationsResponse => ({
    unbondingDelegations: res.unbondingResponses.map(parseUnbondingDelegation),
    pagination: res.pagination ? res.pagination : defaultPaginationResponse(),
});


const parseUnbondingDelegation = (res: UnbondingDelegation): BluechipUnbondingDelegation => ({
    delegatorAddress: res.delegatorAddress,
    validatorAddress: res.validatorAddress,
    entries: res.entries.map(parseUnbondingDelegationEntry),
    totalBalance: getTotalUnbondingDelegationBalance(res.entries)
});


const getTotalUnbondingDelegationBalance = (entries: UnbondingDelegationEntry[]): number =>
    entries.map(parseUnbondingDelegationEntry).reduce((total, entry) => total + entry.balance, 0);


const parseUnbondingDelegationEntry = (res: UnbondingDelegationEntry): BluechipUnbondingDelegationEntry => ({
    creationHeight: Number(res.creationHeight),
    completionTime: res.completionTime || new Date(0),
    initialBalance: Number(res.initialBalance),
    balance: Number(res.balance)
});

