"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eventUtils_1 = require("@ulixee/commons/lib/eventUtils");
const Logger_1 = require("@ulixee/commons/lib/Logger");
const IPendingWaitEvent_1 = require("@ulixee/commons/interfaces/IPendingWaitEvent");
const Resolvable_1 = require("@ulixee/commons/lib/Resolvable");
const os = require("os");
const Connection_1 = require("./Connection");
const BrowserContext_1 = require("./BrowserContext");
const BrowserProcess_1 = require("./BrowserProcess");
const BrowserLaunchError_1 = require("../errors/BrowserLaunchError");
const env_1 = require("../env");
const DevtoolsPreferences_1 = require("./DevtoolsPreferences");
const ChromeEngine_1 = require("./ChromeEngine");
const Path = require("path");
const { log } = (0, Logger_1.default)(module);
let browserIdCounter = 0;
class Browser extends eventUtils_1.TypedEventEmitter {
    constructor(engine, hooks, browserUserConfig, debugLog = false) {
        super();
        this.debugLog = debugLog;
        this.browserContextsById = new Map();
        this.hooks = {};
        this.launchPromise = new Resolvable_1.default();
        this.isLaunchStarted = false;
        this.engine = engine;
        // if chrome engine, make a copy
        if (engine instanceof ChromeEngine_1.default) {
            this.engine = new ChromeEngine_1.default(engine.source);
        }
        this.id = String((browserIdCounter += 1));
        browserUserConfig ?? (browserUserConfig = {});
        browserUserConfig.disableGpu ?? (browserUserConfig.disableGpu = env_1.default.disableGpu);
        browserUserConfig.noChromeSandbox ?? (browserUserConfig.noChromeSandbox = env_1.default.noChromeSandbox);
        browserUserConfig.showChrome ?? (browserUserConfig.showChrome = env_1.default.showChrome);
        this.applyDefaultLaunchArgs(browserUserConfig);
        if (hooks) {
            this.hooks = hooks;
            hooks.onNewBrowser?.(this, browserUserConfig);
        }
        this.afterAllLaunchArgsApplied();
    }
    get name() {
        if (!this.version)
            return 'Unlaunched';
        return this.version.product.split('/').shift();
    }
    get fullVersion() {
        if (!this.version)
            return 'Unlaunched';
        return this.version.product.split('/').pop();
    }
    get majorVersion() {
        if (!this.version)
            return -1;
        return this.fullVersion?.split('.').map(Number).shift();
    }
    get supportsBrowserContextProxy() {
        return this.majorVersion >= 85;
    }
    get defaultBrowserContext() {
        return this.browserContextsById.get(undefined);
    }
    async connect(transport) {
        if (this.isLaunchStarted) {
            await this.launchPromise.promise;
            return this;
        }
        this.isLaunchStarted = true;
        this.connection = new Connection_1.Connection(transport);
        this.devtoolsSession = this.connection.rootSession;
        this.bindDevtoolsEvents();
        this.version = await this.devtoolsSession.send('Browser.getVersion');
        this.connection.once('disconnected', this.emit.bind(this, 'close'));
        this.launchPromise.resolve();
        return this;
    }
    async launch() {
        if (this.isLaunchStarted) {
            await this.launchPromise.promise;
            return this;
        }
        const parentLogId = log.info('Browser.Launching', {
            sessionId: null,
            name: this.engine.name,
            fullVersion: this.engine.fullVersion,
        });
        try {
            this.isLaunchStarted = true;
            await this.engine.verifyLaunchable?.();
        }
        catch (launchError) {
            this.launchPromise.reject(launchError);
            setImmediate(() => this.emit('close'));
            // will bomb here
            await this.launchPromise.promise;
        }
        try {
            this.process = new BrowserProcess_1.default(this.engine);
            this.connection = new Connection_1.Connection(this.process.transport);
            this.devtoolsSession = this.connection.rootSession;
            this.bindDevtoolsEvents();
            await Promise.all([this.testConnection(), this.process.isProcessFunctionalPromise]);
            this.process.once('close', () => this.emit('close'));
            this.launchPromise.resolve();
            log.stats('Browser.Launched', {
                ...this.version,
                executablePath: this.engine.executablePath,
                desiredFullVersion: this.engine.fullVersion,
                sessionId: null,
                parentLogId,
            });
            if (this.engine.isHeaded)
                this.preferencesInterceptor = new DevtoolsPreferences_1.default(this.engine);
            return this;
        }
        catch (err) {
            await this.process.close();
            let launchError;
            // give it a second to read errors
            const processError = await this.process.isProcessFunctionalPromise.catch(error => error);
            let message = 'Failed to launch Chrome!';
            if (err.code === 'EPIPE' && processError)
                err = processError;
            if (err.code !== 'EPIPE') {
                message += ` ${err.message}`;
            }
            if (this.process.launchStderr.length) {
                message +=
                    `\n\n\nSometimes a reason can be found in the Chrome Stderr logs:\n\t` +
                        this.process.launchStderr.join('\n\t');
            }
            launchError = new BrowserLaunchError_1.default(message, err.stack.split(/\r?\n/).slice(1).join('\n'));
            this.launchPromise.reject(launchError);
            log.stats('Browser.LaunchError', {
                launchError,
                parentLogId,
                chromeStderr: this.process.launchStderr.join('\n'),
                sessionId: null,
            });
            setImmediate(() => this.emit('close'));
        }
        finally {
            await this.launchPromise.promise;
        }
    }
    async newContext(options = {}) {
        if (!this.launchPromise)
            throw new IPendingWaitEvent_1.CanceledPromiseError('This Browser has been shut down');
        if (!this.isLaunchStarted)
            throw new Error('This Browser has not had launch() called on it');
        const error = await this.launchPromise.promise;
        if (error)
            throw error;
        if (this.isShuttingDown)
            throw new Error('Shutting down');
        options.isIncognito ?? (options.isIncognito = true);
        if (!options.isIncognito) {
            let defaultContext = this.defaultBrowserContext;
            if (!defaultContext) {
                defaultContext = new BrowserContext_1.default(this, false, options);
                await this.onNewContext(defaultContext);
            }
            defaultContext.proxy = options.proxy;
            return defaultContext;
        }
        const isolatedContext = new BrowserContext_1.default(this, true, options);
        await isolatedContext.open();
        await this.onNewContext(isolatedContext);
        return isolatedContext;
    }
    async connectToPage(targetId, options, hooks) {
        this.connectOnlyToPageTargets ?? (this.connectOnlyToPageTargets = {});
        this.connectOnlyToPageTargets[targetId] = options;
        this.browserContextCreationHooks = hooks;
        await this.devtoolsSession.send('Target.attachToTarget', { targetId, flatten: true });
        await new Promise(setImmediate);
        for (const context of this.browserContextsById.values()) {
            const page = context.pagesById.get(targetId);
            if (page) {
                await page.isReady;
                return page;
            }
        }
    }
    async getAllPageTargets() {
        const targets = await this.devtoolsSession.send('Target.getTargets');
        return targets.targetInfos.filter(x => x.type === 'page');
    }
    getBrowserContext(id) {
        return this.browserContextsById.get(id) ?? this.defaultBrowserContext;
    }
    isEqualEngine(engine) {
        return (this.engine.executablePath === engine.executablePath &&
            this.engine.launchArguments.toString() === engine.launchArguments.toString());
    }
    async close() {
        const closePromises = [];
        if (!this.isLaunchStarted)
            return;
        if (this.isShuttingDown)
            return this.isShuttingDown;
        const parentLogId = log.stats('Browser.Closing');
        try {
            // if we started to get ready, clear out now
            this.isLaunchStarted = false;
            this.isShuttingDown = new Promise(async (resolve) => {
                try {
                    if (this.launchPromise) {
                        const err = await this.launchPromise.catch(startError => startError);
                        this.launchPromise = null;
                        if (err)
                            return resolve(err);
                    }
                    for (const [, context] of this.browserContextsById)
                        closePromises.push(context.close());
                    await Promise.all(closePromises);
                    await this.process?.close();
                    this.connection.dispose();
                }
                finally {
                    resolve();
                }
            });
            return await this.isShuttingDown;
        }
        catch (error) {
            log.error('Browser.Closing:Error', { parentLogId, sessionId: null, error });
        }
        finally {
            this.emit('close');
            this.removeAllListeners();
            log.stats('Browser.Closed', { parentLogId, sessionId: null });
        }
    }
    isConnected() {
        return !this.connection.isClosed;
    }
    bindDevtoolsEvents() {
        this.devtoolsSession.on('Target.attachedToTarget', this.onAttachedToTarget.bind(this));
        this.devtoolsSession.on('Target.detachedFromTarget', this.onDetachedFromTarget.bind(this));
        this.devtoolsSession.on('Target.targetCreated', this.onTargetCreated.bind(this));
        this.devtoolsSession.on('Target.targetInfoChanged', this.onTargetInfoChanged.bind(this));
        this.devtoolsSession.on('Target.targetDestroyed', this.onTargetDestroyed.bind(this));
        this.devtoolsSession.on('Target.targetCrashed', this.onTargetCrashed.bind(this));
    }
    async testConnection() {
        await this.devtoolsSession.send('Target.setAutoAttach', {
            autoAttach: true,
            waitForDebuggerOnStart: true,
            flatten: true,
        });
        await this.devtoolsSession.send('Target.setDiscoverTargets', {
            discover: true,
        });
        this.version = await this.devtoolsSession.send('Browser.getVersion');
        this.connection.once('disconnected', this.emit.bind(this, 'close'));
    }
    afterAllLaunchArgsApplied() {
        if (!this.engine.isHeadlessNew)
            return;
        const launchArgs = this.engine.launchArguments;
        // headless=new requires a profile
        if (!launchArgs.some(x => x.startsWith('--user-data-dir'))) {
            const dataDir = Path.join(os.tmpdir(), `${browserIdCounter}-${this.engine.fullVersion.replace(/\./g, '-')}`);
            this.engine.launchArguments.push(`--user-data-dir=${dataDir}`); // required to allow multiple browsers to be headed
            this.engine.userDataDir = dataDir;
        }
    }
    applyDefaultLaunchArgs(options) {
        this.engine.launchArguments = [...(this.engine.launchArguments ?? [])];
        const launchArgs = this.engine.launchArguments;
        if (options.proxyPort !== undefined && !launchArgs.some(x => x.startsWith('--proxy-server'))) {
            launchArgs.push(
            // Use proxy for localhost URLs
            '--proxy-bypass-list=<-loopback>', `--proxy-server=localhost:${options.proxyPort}`);
        }
        if (options.noChromeSandbox === true) {
            launchArgs.push('--no-sandbox');
        }
        else if (os.platform() === 'linux') {
            const runningAsRoot = process.geteuid && process.geteuid() === 0;
            if (runningAsRoot) {
                // eslint-disable-next-line no-console
                console.warn('WARNING: Agent is being run under "root" user - disabling Chrome sandbox! ' +
                    'Run under regular user to get rid of this warning.');
                launchArgs.push('--no-sandbox');
            }
        }
        launchArgs.push('--remote-debugging-pipe', '--ignore-certificate-errors');
        this.engine.isHeaded = options.showChrome === true;
        if (!this.engine.isHeaded) {
            // NOTE: disabling because something is hanging when launching with headless=new.
            // TODO: some tests still failing
            const majorVersion = this.engine.fullVersion.split('.').map(Number)[0];
            if (majorVersion >= 109 && env_1.default.enableHeadlessNewMode) {
                this.engine.isHeadlessNew = true;
                launchArgs.push('--headless=new');
            }
            else {
                launchArgs.push('--headless');
            }
        }
    }
    onAttachedToTarget(event) {
        const { targetInfo, sessionId } = event;
        this.browserContextsById
            .get(targetInfo.browserContextId)
            ?.targetsById.set(targetInfo.targetId, targetInfo);
        const isDevtoolsPanel = targetInfo.url.startsWith('devtools://devtools');
        const isContextLess = !targetInfo.browserContextId;
        if (isContextLess || (event.targetInfo.type === 'page' &&
            !isDevtoolsPanel &&
            this.connectOnlyToPageTargets &&
            !this.connectOnlyToPageTargets[targetInfo.targetId])) {
            if (this.debugLog) {
                log.stats('Not connecting to target', { event, sessionId: null });
            }
            if (event.waitingForDebugger) {
                this.connection
                    .getSession(sessionId)
                    .send('Runtime.runIfWaitingForDebugger')
                    .catch(() => null)
                    .then(() => this.devtoolsSession.send('Target.detachFromTarget', { sessionId }))
                    .catch(() => null);
                return;
            }
            if (targetInfo.attached) {
                this.devtoolsSession.send('Target.detachFromTarget', { sessionId }).catch(() => null);
            }
            return;
        }
        if (this.debugLog) {
            log.stats('onAttachedToTarget', { event, sessionId: null });
        }
        if (this.connectOnlyToPageTargets &&
            this.connectOnlyToPageTargets[targetInfo.targetId] &&
            !this.browserContextsById.has(targetInfo.browserContextId)) {
            if (this.debugLog) {
                log.stats('Creating BrowserContext for connectOnlyToPageTargets.', {
                    browserContextId: targetInfo.browserContextId,
                    sessionId: null,
                });
            }
            const context = new BrowserContext_1.default(this, false);
            context.hooks = this.browserContextCreationHooks ?? {};
            context.id = targetInfo.browserContextId;
            context.targetsById.set(targetInfo.targetId, targetInfo);
            if (this.connectOnlyToPageTargets) {
                context.addPageInitializationOptions(this.connectOnlyToPageTargets);
            }
            void this.onNewContext(context);
        }
        if (targetInfo.type === 'page' && !isDevtoolsPanel) {
            const devtoolsSession = this.connection.getSession(sessionId);
            const context = this.getBrowserContext(targetInfo.browserContextId);
            context?.onPageAttached(devtoolsSession, targetInfo).catch(console.error);
            return;
        }
        if (targetInfo.type === 'shared_worker') {
            const devtoolsSession = this.connection.getSession(sessionId);
            const context = this.getBrowserContext(targetInfo.browserContextId);
            context?.onSharedWorkerAttached(devtoolsSession, targetInfo).catch(() => null);
        }
        if (targetInfo.type === 'service_worker') {
            const devtoolsSession = this.connection.getSession(sessionId);
            if (!devtoolsSession)
                return;
            const context = this.getBrowserContext(targetInfo.browserContextId);
            context?.onSharedWorkerAttached(devtoolsSession, targetInfo).catch(() => null);
            if (event.waitingForDebugger) {
                devtoolsSession
                    .send('Runtime.runIfWaitingForDebugger')
                    .catch(() => null)
                    .then(() => this.devtoolsSession.send('Target.detachFromTarget', { sessionId }))
                    .catch(() => null);
            }
        }
        if (isDevtoolsPanel) {
            const devtoolsSession = this.connection.getSession(sessionId);
            const context = this.getBrowserContext(targetInfo.browserContextId);
            this.preferencesInterceptor?.installOnConnect(devtoolsSession).catch(() => null);
            void this.hooks?.onDevtoolsPanelAttached?.(devtoolsSession).catch(() => null);
            context?.onDevtoolsPanelAttached(devtoolsSession, targetInfo);
            return;
        }
        if (event.waitingForDebugger && targetInfo.type === 'other') {
            const devtoolsSession = this.connection.getSession(sessionId);
            if (!devtoolsSession)
                return;
            // Ideally, detaching should resume any target, but there is a bug in the backend.
            devtoolsSession
                .send('Runtime.runIfWaitingForDebugger')
                .catch(() => null)
                .then(() => this.devtoolsSession.send('Target.detachFromTarget', { sessionId }))
                .catch(() => null);
        }
    }
    onTargetInfoChanged(event) {
        const { targetInfo } = event;
        this.browserContextsById
            .get(targetInfo.browserContextId)
            ?.targetsById.set(targetInfo.targetId, targetInfo);
    }
    async onTargetCreated(event) {
        const { targetInfo } = event;
        if (this.debugLog) {
            log.stats('onTargetCreated', { targetInfo, sessionId: null });
        }
        this.browserContextsById
            .get(targetInfo.browserContextId)
            ?.targetsById.set(targetInfo.targetId, targetInfo);
        if (targetInfo.type === 'page' && !targetInfo.attached) {
            const context = this.getBrowserContext(targetInfo.browserContextId);
            await context?.attachToTarget(targetInfo.targetId);
        }
        if (targetInfo.type === 'shared_worker') {
            const context = this.getBrowserContext(targetInfo.browserContextId);
            await context?.attachToWorker(targetInfo);
        }
    }
    onTargetDestroyed(event) {
        const { targetId } = event;
        if (this.debugLog) {
            log.stats('onTargetDestroyed', { targetId, sessionId: null });
        }
        for (const context of this.browserContextsById.values()) {
            context.targetDestroyed(targetId);
        }
    }
    onTargetCrashed(event) {
        const { targetId, errorCode, status } = event;
        if (status === 'killed') {
            for (const context of this.browserContextsById.values()) {
                context.targetKilled(targetId, errorCode);
            }
        }
    }
    onDetachedFromTarget(event) {
        const targetId = event.targetId;
        for (const [, context] of this.browserContextsById) {
            context.onTargetDetached(targetId);
        }
    }
    async onNewContext(context) {
        const id = context.id;
        this.browserContextsById.set(id, context);
        context.once('close', () => this.browserContextsById.delete(id));
        this.emit('new-context', { context });
        await this.hooks?.onNewBrowserContext?.(context);
    }
}
exports.default = Browser;
//# sourceMappingURL=Browser.js.map