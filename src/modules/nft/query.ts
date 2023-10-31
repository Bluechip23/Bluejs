import {Collection, MasterEdition, Metadata, NFT} from "../../bluechip/lib/generated/nft/nft";
import {BluechipClient} from "../../core";
import { parseNumToLong } from '../../shared/parse';


export const getNftInfo = (client: BluechipClient, id: string) =>
    client.queryClient.nft.NFTInfo({id})
        .then(resp => ({
            nft: resp.nft && longToNumberNFT(resp.nft),
            metadata: resp.metadata && longToNumberMetadata(resp.metadata)
        }));

export const getCollectionInfo = (client: BluechipClient, id: number) =>
    client.queryClient.nft.Collection({id: parseNumToLong(id)})
        .then(resp => ({
            ...resp,
            collection: resp.collection && longToNumberCollection(resp.collection),
            nfts: resp.nfts.map(longToNumberNFT)
        }));

export const getNftMetadata = (client: BluechipClient, id: number) =>
    client.queryClient.nft.Metadata({id: parseNumToLong(id)})
        .then(resp => ({
            metadata: resp.metadata && longToNumberMetadata(resp.metadata)
        }));

export const getNftByOwner = (client: BluechipClient, owner: string) =>
    client.queryClient.nft.NFTsByOwner({owner})
        .then(resp => ({
            nfts: resp.nfts.map(longToNumberNFT),
            metadata: resp.metadata.map(longToNumberMetadata)
        }));


export const getLastCollectionId = (client: BluechipClient) =>
  client.queryClient.nft.LastCollectionId({})
    .then(res => ({
      id: res.id.toNumber()
    }))

const longToNumberNFT = (nft: NFT) => ({
    ...nft,
    collId: nft.collId.toNumber(),
    seq: nft.seq.toNumber(),
    metadataId: nft.metadataId.toNumber()
});

const longToNumberCollection = (collection: Collection) => ({
    ...collection,
    id: collection.id?.toNumber()
});

const longToNumberMasterEdition = (masterEdition: MasterEdition) => ({
    supply: masterEdition.supply.toNumber(),
    maxSupply: masterEdition.maxSupply.toNumber()
});

const longToNumberMetadata = (metadata: Metadata) => ({
    ...metadata,
    id: metadata.id.toNumber(),
    masterEdition: metadata.masterEdition && longToNumberMasterEdition(metadata.masterEdition)
});