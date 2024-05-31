declare const logLevels: readonly ["trace", "debug", "info", "warn", "error", "log"];
declare const reflectCached: {
    construct: any;
    get: any;
    set: any;
    apply: any;
    setPrototypeOf: any;
    ownKeys: any;
    getOwnPropertyDescriptor: any;
};
