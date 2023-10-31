import {BluechipClient} from "../../core";
import {QueryGetTaxInfoResponse} from "../../bluechip/lib/generated/tax/query";


export const getTaxInfo = (client: BluechipClient): Promise<QueryGetTaxInfoResponse> =>
    client.queryClient.tax.GetTaxInfo({});