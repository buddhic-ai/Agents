import { getUniqueFilenames } from "../VectorSearch/weaviate.js";

/**
 * An AxLLM function that returns a list of documents for a given clientId.
 */
export class DocumentList {
  state: any;

  constructor(state: any) {
    this.state = state;
  }

  toFunction() {
    return {
      name: 'DocumentList',
      description: 'Returns a list of available documents',
      parameters: {
        type: 'object',
        properties: {
          typeOfSearch: {
            type: 'string',
            description: 'The type of search to perform. Can be "filename" or "fileId".'
          }
        },
        required: ['typeOfSearch']
      },
      func: async (args: any) => {
        try {
          const clientId = this.state.get('clientId');

          // Get the list of filenames available for the clientId
          const fileNames = await getUniqueFilenames(clientId);
          
          // Return the answer and references
          return fileNames;
        } catch (error) {
          console.error(`Error during function execution: ${error}`);
          throw error;
        }
      }
    }
  }
}