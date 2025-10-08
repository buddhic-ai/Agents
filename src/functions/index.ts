import { VectorSearch } from './VectorSearch/index.js';
import { DocumentList } from './DocumentList/index.js';
import { getSharedCrewState } from '../state/shared.js';
import { 
  AxCrewFunctions as ImportedAxCrewFunctions, 
  FunctionRegistryType 
} from '@amitdeshmukh/ax-crew';


// Merge imported functions with your custom functions
const AxCrewFunctions = {
  ...ImportedAxCrewFunctions,
  VectorSearch: () => new VectorSearch(getSharedCrewState()).toFunction(),
  DocumentList: () => new DocumentList(getSharedCrewState()).toFunction()
};

export { 
  AxCrewFunctions, 
  FunctionRegistryType 
};