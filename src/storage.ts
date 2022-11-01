import { extractHash, url } from "./utils/ipfs";

/**
 * Resolves ExtendedMetadata content based on CollectionMetadata#data or ItemMetadata#data fields.
 */
export interface StorageResolver {
    resolve(data: string): Promise<any | null>;
}

/**
 * IPFS implementation of `StorageResolver` leveraging IPFS gateways.
 */
export class IPFSGatewayStorageResolver implements StorageResolver {
    async resolve(data: string): Promise<any | null> {
        const ipfsUrl = url(data);
        if (ipfsUrl) {
            const res = await fetch(ipfsUrl);
            if (res.ok) {
                return await res.json();
            }
        }
        return null;
    }
}

/**
 * @param resolvers 
 * @param data 
 * @returns the first answer returned by a resolver. Resolvers are tried in order
 */
export async function resolve(resolvers: Array<StorageResolver>, data: string): Promise<any | null> {
    for (const resolver of resolvers.values()) {
        const content = await resolver.resolve(data);
        if (content) {
            return content;
        }
    }
    return null;
}