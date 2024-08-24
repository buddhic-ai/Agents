import { AxAgent, AxAI, AxAIArgs } from '@ax-llm/ax';
import { getQueryContext } from "./weaviate.js";
import { PROVIDER_API_KEYS, DEBUG } from '../../config/index.js';
import { schema, Reference } from './schema.js';

const ai: AxAI = new AxAI({
  name: 'openai',
  apiKey: PROVIDER_API_KEYS['OPENAI_API_KEY'] || '',
  config: {
    model: 'gpt-4o-mini',
    temperature: 0,
  }
} as AxAIArgs);

ai.setOptions({ debug: DEBUG });

const RAGsignature = `context:string[] 'Relevant information from business documents',
question:string 'Question about business operations'
-> 
answer:string 'Answer to the question',
references: string 'references to relevant info from context in the following JSON schema:\n${JSON.stringify(schema , null, 2)}'
`;

const RAGAgent = new AxAgent(ai, {
  name: 'RAGAgent',
  description: 'Answers questions about business operations.',
  signature: RAGsignature
});


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
      name: 'CompanyPolicySearch',
      description: 'Responds with facts about company policies (one question at a time)',
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

          // Get the context for the question
          let context: any[] = await getQueryContext(clientId, question) || [];

          // Convert context to a markdown formatted array
          context = context.map(doc => {
            const combinedText = doc.items.length > 0 ? `${doc.text}\n- ${doc.items.join('\n- ')}` : doc.text;
            return `### ${doc.filename}\n\n- **File ID**: ${doc.fileId}\n- **URL**: ${doc.url}\n- **Page Number**: ${doc.pageNumber}\n- **Text**: ${combinedText}\n`;
          });

          // Forward the question and context to the RAG agent
          const response = await RAGAgent.forward({ context, question });
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