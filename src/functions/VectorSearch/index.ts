import { AxCrew } from '@amitdeshmukh/ax-crew';
import { getQueryContext } from "./weaviate.js";
import { DEBUG } from '../../config/index.js';
import { schema, Reference } from './schema.js';

const RAGsignature = `context:string[] 'Relevant information from business documents',
question:string 'Question about business operations'
-> 
answer:string 'Answer to the question',
references: string 'references to relevant info from context in the following JSON schema:\n${JSON.stringify(schema , null, 2)}'
`;

const config = {
  crew: [
    {
      name: 'RAGAgent',
      description: 'Answers questions about business operations. Only stick to the context provided.',
      signature: RAGsignature,
      provider: 'openai',
      providerKeyName: 'OPENAI_API_KEY',
      ai: {
        model: "gpt-4o-mini",
        temperature: 0,
        reasoningEffort: "low",
      },
      options: {
        debug: DEBUG,
        stream: false
      },
    }
  ]
}

export class VectorSearch {
  state: any;

  constructor(state: any) {
    this.state = state;
  }

  combinedReferences(references: Reference[]): Reference[] {
    return references.reduce((acc: Reference[], ref: Reference) => {
      const existingRef = acc.find((r: Reference) => r.fileId === ref.fileId);
      if (existingRef) {
        existingRef.pageNumbers = [...new Set([...existingRef.pageNumbers, ...ref.pageNumbers])];
      } else {
        acc.push({ ...ref });
      }
      return acc;
    }, [])
  }

  toFunction() {
    return {
      name: 'DocumentSearch',
      description: 'Responds with facts from available documents',
      parameters: {
        type: 'object',
        properties: {
          question: {
            type: 'string',
            description: 'The question.'
          }
        },
        required: ['question']
      },
      func: async (args: any) => {
        try {
          const { question }  = args;
          const clientId = this.state.get('clientId');

          if (!clientId) {
            throw new Error('Client ID is required');
          }

          // Initialize the crew and agent
          const crew = new AxCrew(config);
          crew.addAgentsToCrew(['RAGAgent']);          
          const ragAgent = crew.agents?.get('RAGAgent');
          
          if (!ragAgent) {
            console.error('Debug: RAGAgent initialization failed. Config used:', config.crew[0]);
            throw new Error('RAGAgent not initialized');
          }

          // Get the context for the question
          let context: any[] = await getQueryContext(clientId, question) || [];

          // Convert context to a markdown formatted array
          context = context.map(doc => {
            const combinedText = doc.items.length > 0 ? `${doc.text}\n- ${doc.items.join('\n- ')}` : doc.text;
            return `### ${doc.filename}\n\n- **File ID**: ${doc.fileId}\n- **URL**: ${doc.url}\n- **Page Number**: ${doc.pageNumber}\n- **Text**: ${combinedText}\n`;
          });

          // Forward the question and context to the agent
          const response = await ragAgent.forward({ 
            context,
            question,
          });
          const answer = response.answer;
          
          // Combine references
          let references: string | Reference[] = response.references as string;
          references = JSON.parse(references) as Reference[];
          references = this.combinedReferences(references);
          
          // Return the answer and references
          return { answer, references };
        } catch (error) {
          console.error(`Error during agent forward: ${error}`);
          throw error;
        }
      }
    }
  }
}