import {createProtobufRpcClient, QueryClient, SequenceResponse, SigningStargateClient} from "@cosmjs/stargate";
import {getRegistry} from "./registry";
import {SigningStargateClientOptions} from "@cosmjs/stargate/build/signingstargateclient";
import {QueryClientImpl as StorageQueryClientImpl} from "../bluechip/lib/generated/storage/query";
import {QueryClientImpl as BankQueryClientImpl} from "../bluechip/lib/generated/cosmos/bank/v1beta1/query";
import {QueryClientImpl as FaucetQueryClientImpl} from '../bluechip/lib/generated/faucet/query'
import {BluechipWallet} from "../wallets/BluechipWallet";
import {QueryClientImpl as TaxQueryClientImpl} from '../bluechip/lib/generated/tax/query';
import {QueryClientImpl as StakingQueryClientImpl} from "../bluechip/lib/generated/cosmos/staking/v1beta1/query";
import {QueryClientImpl as DistributionQueryClientImpl} from "../bluechip/lib/generated/cosmos/distribution/v1beta1/query";
import {QueryClientImpl as NftQueryClientImpl} from "../bluechip/lib/generated/nft/query";
import {QueryClientImpl as AuthzQueryClientImpl} from "../bluechip/lib/generated/cosmos/authz/v1beta1/query";
import {MsgClientImpl as VestingClientImpl} from "../bluechip/lib/generated/cosmos/vesting/v1beta1/tx";
import {QueryClientImpl as GovQueryClientImpl} from "../bluechip/lib/generated/cosmos/gov/v1beta1/query";
import {QueryClientImpl as UpgradeQueryClientImpl} from "../bluechip/lib/generated/cosmos/upgrade/v1beta1/query";
import {QueryClientImpl as ParamsQueryClientImpl} from "../bluechip/lib/generated/cosmos/params/v1beta1/query";
import {ServiceClientImpl} from "../bluechip/lib/generated/cosmos/tx/v1beta1/service";
import {Tendermint34Client} from "@cosmjs/tendermint-rpc";


type QueryClientImpl = {
  storage: StorageQueryClientImpl;
  bank: BankQueryClientImpl;
  faucet: FaucetQueryClientImpl;
  tax: TaxQueryClientImpl;
  staking: StakingQueryClientImpl;
  distribution: DistributionQueryClientImpl;
  tx: ServiceClientImpl;
  nft: NftQueryClientImpl;
  authz: AuthzQueryClientImpl;
  vesting: VestingClientImpl;
  gov: GovQueryClientImpl;
  upgrade: UpgradeQueryClientImpl;
  params: ParamsQueryClientImpl;
}


export interface BluechipClient {
  url: string;
  address: string;
  sgClient: SigningStargateClient;
  queryClient: QueryClientImpl;
  tmClient: Tendermint34Client;
}


export const newBluechipClient = (config: { wallet: () => Promise<BluechipWallet>; url: string }): Promise<BluechipClient> =>
  config.wallet()
    .then(wallet =>
      SigningBluechipClient.connectWithSigner(config.url, wallet, {prefix: 'bluechip', registry: getRegistry()})
        .then(sgClient => Promise.all([
          getRpcClient(config.url),
          sgClient,
          wallet.getAccounts().then(acc => acc[0].address),
          Tendermint34Client.connect(config.url)
        ])))
    .then(([queryClient, sgClient, address, tmClient]) => ({
      url: config.url,
      queryClient,
      sgClient,
      address,
      tmClient
    }));

const getRpcClient = (url: string): Promise<QueryClientImpl> =>
  Tendermint34Client.connect(url)
    .then(tendermintClient => new QueryClient(tendermintClient))
    .then(createProtobufRpcClient)
    .then(rpcClient => Promise.resolve({
      storage: new StorageQueryClientImpl(rpcClient),
      bank: new BankQueryClientImpl(rpcClient),
      faucet: new FaucetQueryClientImpl(rpcClient),
      tax: new TaxQueryClientImpl(rpcClient),
      staking: new StakingQueryClientImpl(rpcClient),
      distribution: new DistributionQueryClientImpl(rpcClient),
      tx: new ServiceClientImpl(rpcClient),
      nft: new NftQueryClientImpl(rpcClient),
      authz: new AuthzQueryClientImpl(rpcClient),
      vesting: new VestingClientImpl(rpcClient),
      gov: new GovQueryClientImpl(rpcClient),
      upgrade: new UpgradeQueryClientImpl(rpcClient),
      params: new ParamsQueryClientImpl(rpcClient),
    }));

export class SigningBluechipClient extends SigningStargateClient {

  private wallet: BluechipWallet

  protected constructor(tmClient: Tendermint34Client | undefined, signer: BluechipWallet, options: SigningStargateClientOptions) {
    super(tmClient, signer, options);
    this.wallet = signer
  }

  getSequenceFromNetwork(address: string): Promise<SequenceResponse> {
    return super.getSequence(address)
  }


  getSequence(address: string): Promise<SequenceResponse> {
    return this.wallet.getSequence(this, address)
  }

  static async connectWithSigner(endpoint: string, signer: BluechipWallet, options = {}) {
    return Tendermint34Client.connect(endpoint)
      .then(tmClient => new SigningBluechipClient(tmClient, signer, options))
  }
}

