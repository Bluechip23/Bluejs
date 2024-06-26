export type {BluechipWallet} from './wallets/BluechipWallet';
export type {BluechipLocalWallet} from './wallets/localWallet';
export {newLocalWallet, LocalWalletOptions} from './wallets/localWallet';
export {newKeplrWallet, BluechipKeplrWallet, Ports} from './wallets/keplrWallet';
export {newCosmostationWallet, BluechipCosmostationWallet} from "./wallets/cosmosStation"
export * from "./core";
export * from "./modules/bank";
export * from "./modules/faucet";
export * from "./modules/tax";
export * from "./modules/staking";
export * from "./modules/distribution";
export * from "./modules/nft";
export * from "./modules/authz";
export * from "./modules/storage";
export * from "./modules/params";
export * from "./modules/gov";
export * from "./modules/upgrade";
export {
    BluechipCoin
} from "./shared/types";
export {
    BluechipPageRequest,
    defaultPaginationOptions,
    defaultPaginationResponse
} from "./shared/pagination";
export {generateMnemonic} from "./utils/generateMnemonic";

export {
    ParseFn,
    deepParseLong,
} from "./shared/parse";

// export {newKeplrWallet, BluechipKeplrWallet}
//
// (global as any).newKeplerWallet = newKeplrWallet;




