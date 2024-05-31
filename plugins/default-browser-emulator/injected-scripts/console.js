const logLevels = ['trace', 'debug', 'info', 'warn', 'error', 'log'];
const reflectCached = ReflectCached;
for (const logLevel of logLevels) {
    proxyFunction(console, logLevel, (target, thisArg, args) => {
        const safeArgs = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg, null, 2);
            }
            return arg;
        });
        return reflectCached.apply(target, thisArg, safeArgs);
    });
}
