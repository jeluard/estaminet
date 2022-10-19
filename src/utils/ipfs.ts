export function url(hash: string): string {
    // https://gateway.pinata.cloud/ipfs/
    // https://ipfs.pixura.io/ipfs/
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

export function extractHash(uri: string): string | undefined {
    return uri.split("/").at(-1);
}