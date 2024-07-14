import { AxAgent, AxAI, AxAIArgs } from '@ax-llm/ax';
import { getQueryContext } from "./weaviate.js";
import { PROVIDER_API_KEYS, DEBUG } from '../../config/index.js';

const ai: AxAI = new AxAI({
  name: 'cohere',
  apiKey: PROVIDER_API_KEYS['COHERE_API_KEY'] || '',
  config: {
    model: 'command-r-plus',
    temperature: 0
  }
} as AxAIArgs);

ai.setOptions({ debug: DEBUG });

const RAGsignature = `context:string[] 'Relevant information from business documents',
  question:string 'Question about business operations'
  -> 
  answer:string 'Answer to the question'
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
            return `### ${doc.filename}\n\n- **URL**: ${doc.url}\n- **Page Number**: ${doc.pageNumber}\n- **Text**: ${combinedText}\n`;
          });

          // Forward the broken down question and context to the RAG agent
          const { answer } = await RAGAgent.forward({ context, question });
          return answer;
        } catch (error) {
          console.error(`Error during agent forward: ${error}`);
          throw error;
        }
      }
    }
  }
}