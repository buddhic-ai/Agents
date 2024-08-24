import weaviate from 'weaviate-client';
import type { WeaviateClient, Collection, CollectionConfig, WeaviateObject, WeaviateField } from 'weaviate-client';
import { generateEmbeddings }  from './embeddings.js';
import { getDecryptedKey, decrypt } from './crypto.js';
import { WEAVIATE_SCHEME, WEAVIATE_HOST, WEAVIATE_APIKEY } from '../../config/index.js';

const WEAVIATE_INSTANCE_URL: string = `${WEAVIATE_SCHEME}://${WEAVIATE_HOST}`;

const weaviateClient: WeaviateClient = await weaviate.connectToWeaviateCloud(
  WEAVIATE_INSTANCE_URL,
  {
    authCredentials: new weaviate.ApiKey(WEAVIATE_APIKEY)
  }
);

/**
 * Converts a clientId to a Weaviate class name.
 *
 * @param {string} clientId - The clientId to convert.
 * @returns {string} The Weaviate class name.
 */
const clientIdToWeaviateClassName = (clientId: string) => {  
  const sanitizedClientId = clientId.replace(/-/g, '_');
  return `Client_${sanitizedClientId}`;
}

/**
 * Fetches all schemas from the Weaviate server.
 * @async
 * @returns {Promise} The response from the Weaviate server.
 */
const getSchemas = async () => {
  const response = weaviateClient.collections.listAll();
  return response;
}

/**
 * Fetches a specific collection from the Weaviate server.
 * @async 
 * @param {string} className - The name of the class to fetch.
 * @returns {Promise} The response from the Weaviate server.
 */
const getCollection = async (className: string): Promise<Collection> => {
  const collection = await weaviateClient.collections.get(className);
  return collection;
}

/**
 * Fetches the collectionConfig for a specific class from the Weaviate server.
 * @async
 * @param {string} className - The name of the class to fetch the schema for.
 * @returns {Promise} The response from the Weaviate server.
 */
const getCollectionConfig = async (className: string): Promise<CollectionConfig> => {
  const collection = await getCollection(className);
  const collectionConfig= await collection.config.get();
  return collectionConfig;
}

/**
 * Extracts property names from a class schema.
 * @param {Object} classSchema - The class schema to extract property names from.
 * @returns {String} A string of property names that can be used directly in a weaviate query.
 */
const getPropertyNames = (classSchema: { properties: any[] }) => {
  const extractProperties = (props: any[]): any => {
    return props.map(property => {
      if (property.nestedProperties) {
        return `${property.name} { ${extractProperties(property.nestedProperties)} }`;
      }
      return property.name;
    }).join(', ');
  };

  return extractProperties(classSchema.properties);
}

interface DocumentProperties {
  fileId?: string;
  filename?: string;
  text?: string;
  items?: string[];
  url?: string;
  metadata?: {
    page_number?: number;
  };
}

interface SearchResult {
  fileId?: string;
  filename?: string;
  text?: string;
  items?: string[];
  url?: string;
  pageNumber?: number;
}

/**
 * Retrieve context from vector search.
 * @async
 * @param {string} clientId - The clientId to search for.
 * @param {string} message - The query to search for.
 * @returns {Promise<Array>} The search results with the fields url, text, title and _additional.
 * @throws {Error} When an error occurs during the search.
 */
const getQueryContext = async (clientId: string, message: string): Promise<SearchResult[]> => {
  try {
    // Convert clientId to Weaviate class name
    const className = clientIdToWeaviateClassName(clientId);

    // Obtain embeddings for the message
    const vector = await generateEmbeddings(message);

    // Get collection
    const collection = await getCollection(className);

    // Retrieve class schema and extract property names
    const collectionConfig = await getCollectionConfig(className);
    let fields = getPropertyNames(collectionConfig);

    // Retrieve relevant context from weaviate
    const result = await collection.query.nearVector(vector, {
      fields: fields,
      limit: 20,
      returnMetadata: ['distance']
    } as any);

    const context: WeaviateObject<WeaviateField>[] = result.objects

    // Determine if we need to decrypt context
    let aesKey = getDecryptedKey(clientId);

    // Decrypt context if applicable 
    if (aesKey) {
      try {
        // Decrypt the 'items' and 'text' properties of each context doc
        context.map(doc => {
          const properties = doc.properties as DocumentProperties;
          // Decrypt 'items' array if it exists and is not empty
          if (properties.items && properties.items.length) {
            properties.items = properties.items.map(encryptedItem => decrypt(encryptedItem, aesKey));
          }
          // Decrypt 'text' property if it exists and is not empty
          if (properties.text && properties.text.length) {
            properties.text = decrypt(properties.text, aesKey);
          }
          return doc;
        });
      } catch (error) {
        console.error(`Decryption failed: ${(error as Error).message}`);
      }
    }

    const searchResults: SearchResult[] = context.map((doc): SearchResult => {
      const properties  = doc.properties as DocumentProperties;
      return {
        fileId: properties?.fileId,
        filename: properties?.filename,
        text: properties?.text,
        items: properties?.items,
        url: properties?.url,
        pageNumber: properties?.metadata?.page_number
      }
    })

    return searchResults;

  } catch (error) {
    console.error(error);
    return [];
  }
}

export {
  getQueryContext,
}