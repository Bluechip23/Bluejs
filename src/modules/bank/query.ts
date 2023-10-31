import {BluechipClient} from "../../core";
import { QueryTotalSupplyResponse } from '../../bluechip/lib/generated/cosmos/bank/v1beta1/query';
import {BluechipCoin} from "../../shared/types";
import { parseLongCoin } from '../../shared/parse';


type BluechipTotalSupply = {
  supply: BluechipCoin[]
}


export const getAccountBalance = (client: BluechipClient, address: string, denom: string = "ubluechip"): Promise<number> =>
    client.queryClient.bank.Balance({address: address, denom})
        .then(res => Number(res.balance?.amount));


export const getTotalSupply = (client: BluechipClient): Promise<BluechipTotalSupply> =>
    client.queryClient.bank.TotalSupply({})
        .then(parseQueryTotalSupplyResponseToBluechipTotalSupply);


const parseQueryTotalSupplyResponseToBluechipTotalSupply = (res: QueryTotalSupplyResponse): Promise<BluechipTotalSupply> =>
    Promise.resolve(res.supply.map(parseLongCoin))
        .then(supply => ({
            supply
        }));
