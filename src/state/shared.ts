let sharedCrewState: any = null;

function setSharedCrewState(state: any) {
  sharedCrewState = state;
}

function getSharedCrewState<T = any>(): T {
  return sharedCrewState as T;
}

export { setSharedCrewState, getSharedCrewState };


