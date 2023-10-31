import {PageResponse} from "../bluechip/lib/generated/cosmos/base/query/v1beta1/pagination";

const Long = require("long");

export type BluechipPageRequest = {
    key: Uint8Array,
    offset: number,
    limit: number,
    countTotal: boolean,
    reverse: boolean,
}

export const defaultPaginationOptions = (): BluechipPageRequest => ({
    key: new Uint8Array(),
    offset: 0,
    limit: 10,
    countTotal: true,
    reverse: false,
});

export const defaultPaginationResponse = (): PageResponse => ({nextKey: new Uint8Array(), total: Long.fromValue(0)});