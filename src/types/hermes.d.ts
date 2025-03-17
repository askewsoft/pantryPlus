declare global {
  var HermesInternal: null | {
    getRuntimeProperties?: () => Record<string, unknown>;
  };
}

export {}; 