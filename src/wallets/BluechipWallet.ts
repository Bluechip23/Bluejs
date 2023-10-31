import {OfflineDirectSigner} from "@cosmjs/proto-signing/build/signer";
import {SequenceResponse} from "@cosmjs/stargate";
import {SigningBluechipClient} from "../core";

export interface BluechipWallet extends OfflineDirectSigner {
    getSequence: (client: SigningBluechipClient, signerAddress: string) => Promise<SequenceResponse>
}

