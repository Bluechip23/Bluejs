import {BluechipClient, BroadcastOptions, sendTx} from "../../core";
import {
    MsgCreateCollection,
    MsgCreateNFT,
    MsgPrintEdition,
    MsgSignMetadata,
    MsgTransferNFT,
    MsgUpdateCollectionMutableUri,
    MsgUpdateCollectionUri,
    MsgUpdateMetadata,
    MsgUpdateMetadataAuthority,
    MsgUpdateMintAuthority
} from "../../bluechip/lib/generated/nft/tx";
import {Creator, Metadata} from "../../bluechip/lib/generated/nft/nft";
import { parseNumToLong } from '../../shared/parse';


type MetadataHumanReadable = {
    name: string;
    uri: string;
    mutableUri?: string;
    sellerFeeBasisPoints: number;
    primarySaleHappened: boolean;
    isMutable: boolean;
    creators: Creator[];
    metadataAuthority: string;
    mintAuthority: string;
    masterEdition?: {maxSupply: number };
}

export function createNft(client: BluechipClient, props: { collId: number, metadata?: MetadataHumanReadable }, options: BroadcastOptions) {
    return Promise.resolve(sendTx<MsgCreateNFT>(client, '/bluechip.bluechip.nft.MsgCreateNFT', {
        sender: client.address,
        collId: parseNumToLong(props.collId),
        metadata: props.metadata ? props.metadata && adaptMetadataProps(props.metadata) : {
          id: parseNumToLong(1),
          name: "",
          uri: "",
          mutableUri: "",
          sellerFeeBasisPoints: 0,
          primarySaleHappened: false,
          isMutable: true,
          creators: [],
          metadataAuthority: client.address,
          mintAuthority: client.address,
          masterEdition: {
            supply: parseNumToLong(1),
            maxSupply: parseNumToLong(1)
          }
        }
    }, options));

    function adaptMetadataProps(props: MetadataHumanReadable): Metadata {
        return ({
            ...props,
            mutableUri: props.mutableUri || '',
            id: parseNumToLong(1),
            masterEdition: props.masterEdition && {
                supply: parseNumToLong(1),
                maxSupply: parseNumToLong(props.masterEdition.maxSupply)
            }
        })
    }
}

export const createCollection = (
    client: BluechipClient,
    {sender, symbol, name, uri, isMutable, updateAuthority, mutableUri}: {
        sender: string,
        symbol: string,
        name: string,
        uri: string,
        mutableUri?: string,
        isMutable: boolean,
        updateAuthority: string
    },
    options: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgCreateCollection>(client, '/bluechip.bluechip.nft.MsgCreateCollection', {
        sender,
        symbol,
        name,
        uri,
        mutableUri: mutableUri || '',
        isMutable,
        updateAuthority,
    }, options));

export const transferNft = (client: BluechipClient, id: string, toAddress: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgTransferNFT>(client, '/bluechip.bluechip.nft.MsgTransferNFT', {
        sender: client.address,
        id,
        newOwner: toAddress
    }, broadcastOptions));

export const printNftEdition = (client: BluechipClient, metadataId: number, collId: number, owner: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgPrintEdition>(client, '/bluechip.bluechip.nft.MsgPrintEdition', {
        sender: client.address,
        metadataId: parseNumToLong(metadataId),
        collId: parseNumToLong(collId),
        owner,
    }, broadcastOptions));

export function updateMetadata(client: BluechipClient, props: {
    sender: string;
    metadataId: number;
    name: string;
    uri: string;
    mutableUri?: string;
    sellerFeeBasisPoints: number;
    creators: Creator[]
}, broadcastOptions: BroadcastOptions) {
    return Promise.resolve(sendTx<MsgUpdateMetadata>(client, '/bluechip.bluechip.nft.MsgUpdateMetadata', adaptUpdateMetadataProps(props.metadataId, props.mutableUri || "", props), broadcastOptions))

    function adaptUpdateMetadataProps(id: number, mutableUri: string, props: Omit<MsgUpdateMetadata, 'metadataId' | 'mutableUri'>): MsgUpdateMetadata {
        return ({
            ...props,
            mutableUri,
            metadataId: parseNumToLong(id)
        })
    }
}

export const updateMetadataAuthority = (client: BluechipClient, metadataId: number, newAuthority: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgUpdateMetadataAuthority>(client, '/bluechip.bluechip.nft.MsgUpdateMetadataAuthority', {
        sender: client.address,
        metadataId: parseNumToLong(metadataId),
        newAuthority
    }, broadcastOptions));

export const updateMintAuthority = (client: BluechipClient, metadataId: number, newAuthority: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgUpdateMintAuthority>(client, '/bluechip.bluechip.nft.MsgUpdateMintAuthority', {
        sender: client.address,
        metadataId: parseNumToLong(metadataId),
        newAuthority
    }, broadcastOptions));

export const updateCollectionUri = (client: BluechipClient, collectionId: number, uri: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgUpdateCollectionUri>(client, '/bluechip.bluechip.nft.MsgUpdateCollectionUri', {
        sender: client.address,
        collectionId: parseNumToLong(collectionId),
        uri
    }, broadcastOptions));

export const updateCollectionMutableUri = (client: BluechipClient, collectionId: number, uri: string, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgUpdateCollectionMutableUri>(client, '/bluechip.bluechip.nft.MsgUpdateCollectionMutableUri', {
        sender: client.address,
        collectionId: parseNumToLong(collectionId),
        uri
    }, broadcastOptions));

export const signMetadata = (client: BluechipClient, metadataId: number, broadcastOptions: BroadcastOptions) =>
    Promise.resolve(sendTx<MsgSignMetadata>(client, '/bluechip.bluechip.nft.MsgSignMetadata', {
        sender: client.address,
        metadataId: parseNumToLong(metadataId)
    }, broadcastOptions));