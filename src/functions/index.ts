import { AxFunction } from '@ax-llm/ax';
import { CurrentDateTime, DaysBetweenDates } from './dateTime.js';
import { VectorSearch } from './VectorSearch/index.js';

// FunctionRegistryType
type FunctionRegistryType = {
  [key: string]: AxFunction | { new(state: Record<string, any>): { toFunction: () => AxFunction } };
};

const AxCrewFunctions = {
  CurrentDateTime,
  DaysBetweenDates,
  VectorSearch
};

export { AxCrewFunctions, FunctionRegistryType };