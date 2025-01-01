import { VectorSearch } from './VectorSearch/index.js';
import { DocumentList } from './DocumentList/index.js';
import { 
  AxCrewFunctions as ImportedAxCrewFunctions, 
  FunctionRegistryType 
} from '@amitdeshmukh/ax-crew';


// Merge imported functions with your custom functions
const AxCrewFunctions = {
  ...ImportedAxCrewFunctions,
  VectorSearch,
  DocumentList
};

export { 
  AxCrewFunctions, 
  FunctionRegistryType 
};