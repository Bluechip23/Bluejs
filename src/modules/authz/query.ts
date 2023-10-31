import {BluechipClient} from "../../core";
import {QueryGrantsResponse} from "../../bluechip/lib/generated/cosmos/authz/v1beta1/query";
import {PageRequest} from "../../bluechip/lib/generated/cosmos/base/query/v1beta1/pagination";
import {msgMapping, MsgType} from "./authzTypes";
import {BluechipPageRequest, defaultPaginationOptions} from "../../shared/pagination";
import { parseNumToLong } from '../../shared/parse';

export type QueryAuthorizationsParams = {
    granter: string,
    grantee: string,
    msg: MsgType
}

export const queryAuthorizations = (
    client: BluechipClient,
    params: QueryAuthorizationsParams,
    options: BluechipPageRequest = defaultPaginationOptions()
): Promise<QueryGrantsResponse> =>
    client.queryClient.authz.Grants({
        granter: params.granter,
        grantee: params.grantee,
        msgTypeUrl: msgMapping[params.msg],
        pagination: {
            key: options.key,
            offset: parseNumToLong(options.offset),
            limit: parseNumToLong(options.limit),
            countTotal: options.countTotal,
            reverse: options.reverse
        } as PageRequest
    })
        .catch(() => ({grants: []}) as QueryGrantsResponse);