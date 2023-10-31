import {SigningBluechipClient} from "../core";
import {SequenceResponse} from "@cosmjs/stargate";
import {
    DirectSecp256k1HdWallet,
    DirectSecp256k1HdWalletOptions
} from "@cosmjs/proto-signing/build/directsecp256k1hdwallet";
import {Bip39, EnglishMnemonic, HdPath, Slip10RawIndex} from "@cosmjs/crypto";
import {passThrough} from "promise-passthrough";
import {BluechipWallet} from "./BluechipWallet";

export interface LocalWalletOptions {
    coinType?: number
    index?: number
}


export const newLocalWallet = (mnemonic: string, options: LocalWalletOptions = {}) => (): Promise<BluechipWallet> => Promise.resolve(
    BluechipLocalWallet.fromMnemonic(mnemonic, {prefix: 'bluechip', hdPaths:[makePath(options.index, options.coinType)]}));

type AccountAddress = string;

export class BluechipLocalWallet extends DirectSecp256k1HdWallet implements BluechipWallet {

    sequenceTable: Record<AccountAddress, SequenceResponse> = {}
    getSequenceQueue: Promise<SequenceResponse> = Promise.resolve({} as SequenceResponse)

    public static async fromMnemonic(
        mnemonic: string,
        options: Partial<DirectSecp256k1HdWalletOptions> = {},
    ): Promise<BluechipLocalWallet> {

        const mnemonicChecked = new EnglishMnemonic(mnemonic);
        const seed = await Bip39.mnemonicToSeed(mnemonicChecked, options.bip39Password);
        return new BluechipLocalWallet(mnemonicChecked, {
            ...options,
            seed: seed,
        });
    }

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

function makePath(idx: number =  0, coinType: number = 483): HdPath {
    return [
        Slip10RawIndex.hardened(44),
        Slip10RawIndex.hardened(coinType),  // BNT
        Slip10RawIndex.hardened(0),
        Slip10RawIndex.normal(0),
        Slip10RawIndex.normal(idx),
    ];
}
