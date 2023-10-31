import {BluechipClient} from "../../core";
import { QueryParamsResponse } from '../../bluechip/lib/generated/cosmos/params/v1beta1/query';


export const getParamValue = (
  client: BluechipClient,
  params: {
    subspace: string;
    key: string;
  }
): Promise<QueryParamsResponse> =>
  client.queryClient.params.Params(params);
