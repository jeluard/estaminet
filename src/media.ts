import { url } from "./utils/ipfs";

/**
 * Resolves a chunk of data into something that can be used as an image element `src` attribute.
 */
export interface SourceResolver {
    resolve(data: string): string | undefined;
}

export class IPFSGatewaySourceResolver implements SourceResolver {
    resolve(data: string): string | undefined {
        return url(data);
    }
}