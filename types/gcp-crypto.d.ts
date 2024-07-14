declare module '@amitdeshmukh/gcp-crypto' {
  export default class GCPCrypto {
    constructor(projectId: string, location: string, keyRing: string);

    decryptAllKeys(): Promise<Array<{ keyId: string; decryptedKey: string }>>;
  }
}