let transformers: typeof import('@xenova/transformers');

/**
 * Embed a chunk of text using Transformers.js
 * @param {string} chunk - The text to embed
 * @returns {Promise<number[]>} The embedding as an array of numbers
 */
export const generateEmbeddings = async (chunk: string): Promise<number[]> => {
  // Dynamically import transformers only when the function is called
  if (!transformers) {
    transformers = await import('@xenova/transformers');
  }

  const model = 'Snowflake/snowflake-arctic-embed-m-long';
  const getEmbeddings = await transformers.pipeline(
    'feature-extraction',
    model
  );
  
  let result = await getEmbeddings(chunk, {
    pooling: 'mean',
    normalize: true,
  });

  // Convert tensor to array
  return Array.from(result.data);
}
