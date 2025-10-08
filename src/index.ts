import { AxCrew as BaseAxCrew } from '@amitdeshmukh/ax-crew';
import { AxCrewFunctions } from './functions/index.js';
import { buildDecryptedKeysCache } from './functions/VectorSearch/crypto.js';
import { setSharedCrewState } from './state/shared.js';

class AxCrew extends BaseAxCrew {
  constructor(config: any, functionsRegistry?: any, crewId?: string) {
    super(config, functionsRegistry, crewId);
    setSharedCrewState(this.state);
  }
}

export { 
  AxCrew,
  AxCrewFunctions,
  buildDecryptedKeysCache,
};