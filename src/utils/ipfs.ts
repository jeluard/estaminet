export function url(data: string): string | undefined {
  // https://gateway.pinata.cloud/ipfs/
  // https://ipfs.pixura.io/ipfs/
  const hash = extractHash(data);
  if (hash) {
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  }
}

/**
 * @param uri
 * @returns a IPFS hash from a data chunk (IPFS URI (e.g. ipfs://ipfs/Qm..), hash code)
 */
export function extractHash(data: string): string | undefined {
  return data.split('/').at(-1);
}
