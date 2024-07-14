import dotenv from 'dotenv';
dotenv.config();

const DEBUG = process.env.DEBUG === 'true';
// Weaviate
const WEAVIATE_SCHEME: string = process.env.WEAVIATE_SCHEME || 'http';
const WEAVIATE_HOST:string = process.env.WEAVIATE_HOST || 'localhost:8080';
const WEAVIATE_APIKEY:string = process.env.WEAVIATE_APIKEY || '';

// GCP
const GCP_PROJECT_ID: string = process.env.GCP_PROJECT_ID || '';
const GCP_LOCATION: string = process.env.GCP_LOCATION || 'asia-southeast1';
const GCP_RAG_KEYRING: string = process.env.GCP_RAG_KEYRING || '';
const GCP_CRYPTO_SECRET: string = process.env.GCP_CRYPTO_SECRET || '';

// AI API keys
const ANTHROPIC_API_KEY: string | undefined = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY: string = process.env.OPENAI_API_KEY || '';
const COHERE_API_KEY: string = process.env.COHERE_API_KEY || '';
const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || '';

interface ProviderApiKeys {
  [key: string]: string | undefined;
}

const PROVIDER_API_KEYS: ProviderApiKeys = {
  COHERE_API_KEY,
  GEMINI_API_KEY,
  OPENAI_API_KEY,
  ANTHROPIC_API_KEY,
};

export {
  DEBUG,
  WEAVIATE_SCHEME,
  WEAVIATE_HOST,
  WEAVIATE_APIKEY,
  PROVIDER_API_KEYS,
  GCP_PROJECT_ID,
  GCP_LOCATION,
  GCP_RAG_KEYRING,
  GCP_CRYPTO_SECRET
};