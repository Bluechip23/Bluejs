import {getStatus, newBluechipClient, SigningBluechipClient} from "../core";
import {SequenceResponse} from "@cosmjs/stargate";
import {passThrough, passThroughAwait} from "promise-passthrough";
import {BluechipWallet} from "./BluechipWallet";
import {Window} from '@keplr-wallet/types';
import {AccountData, DirectSignResponse, OfflineDirectSigner} from "@cosmjs/proto-signing/build/signer";
import {newLocalWallet} from "./localWallet";
import * as bip39 from 'bip39';

interface SignDoc {
    bodyBytes: Uint8Array;
    authInfoBytes: Uint8Array;
    chainId: string;
    accountNumber: Long;
}

export type Ports = {
    rpcPort: number,
    restPort: number
}

const addBluechipChain = (chainId: string, nodeAddress: string, ports: Ports, protocol: 'https' | 'http') =>
    (window as Window).keplr?.experimentalSuggestChain({
        chainId: chainId,
        chainName: `Bluechip:${chainId}`,
        rpc: `${protocol}://${nodeAddress}:${ports.rpcPort}`,
        rest: `${protocol}://${nodeAddress}:${ports.restPort}`,
        bip44: {
            coinType: 483,
        },
        bech32Config: {
            bech32PrefixAccAddr: "bluechip",
            bech32PrefixAccPub: "bluechip" + "pub",
            bech32PrefixValAddr: "bluechip" + "valoper",
            bech32PrefixValPub: "bluechip" + "valoperpub",
            bech32PrefixConsAddr: "bluechip" + "valcons",
            bech32PrefixConsPub: "bluechip" + "valconspub",
        },
        currencies: [
            {
                coinDenom: "BLZ",
                coinMinimalDenom: "ubluechip",
                coinDecimals: 6,
                coinGeckoId: "bluechip",
            },
            {
                coinDenom: "ELT",
                coinMinimalDenom: "uelt",
                coinDecimals: 6,
            },
            {
                coinDenom: "G4",
                coinMinimalDenom: "ug4",
                coinDecimals: 6,
            },
        ],
        feeCurrencies: [
            {
                coinDenom: "BLZ",
                coinMinimalDenom: "ubluechip",
                coinDecimals: 6,
                coinGeckoId: "bluechip",
            },
        ],
        stakeCurrency: {
            coinDenom: "BLZ",
            coinMinimalDenom: "ubluechip",
            coinDecimals: 6,
            coinGeckoId: "bluechip",
        },
        coinType: 483,
        gasPriceStep: {
            low: 0.002,
            average: 0.002,
            high: 0.002,
        }
    });

export const newKeplrWallet = (
    nodeAddress: string,
    connectionParams: {ports: Ports, protocol: 'http' | 'https'} = {ports: {rpcPort: 26657, restPort: 1317}, protocol: 'https'}
) => (): Promise<BluechipWallet> =>
    generateMnemonic()
        .then(mnemonic => newBluechipClient({
            url: `${connectionParams.protocol}://${nodeAddress}:${connectionParams.ports.rpcPort}`,
            wallet: newLocalWallet(mnemonic)
        }))
        .then(client => getStatus(client))
        .then(passThroughAwait(status =>
            (window as Window).keplr?.enable(status.chainId)
                .catch(e => {console.log(e); return addBluechipChain(status.chainId, nodeAddress, connectionParams.ports, connectionParams.protocol)})
        ))
        .then(status => (window as Window).keplr?.getOfflineSigner(status.chainId))
        .then((keplrOfflineSigner) => new BluechipKeplrWallet(keplrOfflineSigner as OfflineDirectSigner));

type AccountAddress = string;

export class BluechipKeplrWallet implements BluechipWallet {

    getAccounts: () => Promise<readonly AccountData[]>;
    signDirect: (signerAddress: string, signDoc: SignDoc) => Promise<DirectSignResponse>;

    constructor(keplrOfflineSigner: OfflineDirectSigner) {
        this.getAccounts = keplrOfflineSigner.getAccounts.bind(keplrOfflineSigner)
        this.signDirect = keplrOfflineSigner.signDirect.bind(keplrOfflineSigner)
    }

    sequenceTable: Record<AccountAddress, SequenceResponse> = {}
    getSequenceQueue: Promise<SequenceResponse> = Promise.resolve({} as SequenceResponse)

    getSequence(client: SigningBluechipClient, signerAddress: string): Promise<SequenceResponse> {
        return this.getSequenceQueue = this.getSequenceQueue.then(() =>
            Promise.resolve(this.sequenceTable[signerAddress])
                .then(accountInfo => accountInfo || client.getSequenceFromNetwork(signerAddress))
                .then(passThrough(response => {
                    this.sequenceTable[signerAddress] = {
                        ...response,
                        sequence: response.sequence + 1,
                    }
                }))
        )
    }
}

const generateMnemonic = (): Promise<string> =>
    Promise.resolve(bip39.generateMnemonic(256))
