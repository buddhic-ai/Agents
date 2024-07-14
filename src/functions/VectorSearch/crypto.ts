import GCPCrypto from '@amitdeshmukh/gcp-crypto';
import Cryptr from 'cryptr';
import { GCP_PROJECT_ID, GCP_LOCATION, GCP_RAG_KEYRING } from '../../config/index.js';

// Define an interface for the decrypted keys
interface DecryptedKey {
  keyId: string;
  decryptedKey: string;
}

// Use TypeScript's Record type to enforce the cache structure
const decryptedKeysCache: Record<string, string> = {};

// Initialize the module
const gcpCrypto = new GCPCrypto(GCP_PROJECT_ID, GCP_LOCATION, GCP_RAG_KEYRING);

/**
 * Asynchronously builds a cache of decrypted keys by decrypting all keys.
 * On success, the decrypted keys are stored in the `decryptedKeysCache` object.
 * If an error occurs during the decryption process, it is logged and rethrown.
 * @async
 * @function buildDecryptedKeysCache
 * @returns {Promise<void>} A promise that resolves when the cache has been built.
 * @throws {Error} If an error occurs while decrypting the keys.
 */
const buildDecryptedKeysCache = async (): Promise<void> => {
  try {
    let result = await gcpCrypto.decryptAllKeys();
    result.forEach((key: DecryptedKey) => {
      decryptedKeysCache[key.keyId] = key.decryptedKey;
    });
    console.log('Key cache build complete.');
  } catch (error) {
    console.error('Error building key cache: ', error);
    throw error;
  }
}

/**
 * Retrieves a decrypted key from the cache using the provided keyId.
 * @param {string} keyId - The identifier for the key to retrieve.
 * @returns {string|null} The decrypted key if found in the cache, or null if not found.
 */
const getDecryptedKey = (keyId: string): string | null => {
  return decryptedKeysCache[keyId] || null;
};

/**
 * Decrypts the provided encrypted data using the specified keyId.
 * @param {string} encryptedData - The data to be decrypted.
 * @param {string} key - The key to use for decryption.
 * @returns {string} The decrypted data.
 */
const decrypt = (encryptedData: string, key: string): string => {
  try {
    const cryptr = new Cryptr(key);
    const decryptedData = cryptr.decrypt(encryptedData);
    return decryptedData;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw error;
  }
};

export {
  buildDecryptedKeysCache,
  getDecryptedKey,
  decryptedKeysCache,
  decrypt
};
