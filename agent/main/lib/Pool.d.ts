import { MitmProxy } from '@ulixee/unblocked-agent-mitm';
import IBrowserEngine from '@ulixee/unblocked-specification/agent/browser/IBrowserEngine';
import { TypedEventEmitter } from '@ulixee/commons/lib/eventUtils';
import { ICertificateStore } from '@ulixee/unblocked-agent-mitm/interfaces/ICertificateGenerator';
import { IBoundLog } from '@ulixee/commons/interfaces/ILog';
import IBrowserUserConfig from '@ulixee/unblocked-specification/agent/browser/IBrowserUserConfig';
import { IHooksProvider } from '@ulixee/unblocked-specification/agent/hooks/IHooks';
import { IUnblockedPluginClass } from '@ulixee/unblocked-specification/plugin/IUnblockedPlugin';
import Browser from './Browser';
import Agent, { IAgentCreateOptions } from './Agent';
import IEmulationProfile from '@ulixee/unblocked-specification/plugin/IEmulationProfile';
interface ICreatePoolOptions {
    maxConcurrentAgents?: number;
    certificateStore?: ICertificateStore;
    defaultBrowserEngine?: IBrowserEngine;
    plugins?: IUnblockedPluginClass[];
    dataDir?: string;
    logger?: IBoundLog;
}
export default class Pool extends TypedEventEmitter<{
    'agent-created': {
        agent: Agent;
    };
    'browser-launched': {
        browser: Browser;
    };
    'browser-has-no-open-windows': {
        browser: Browser;
    };
    'all-browsers-closed': void;
}> {
    #private;
    readonly options: ICreatePoolOptions;
    get hasAvailability(): boolean;
    get activeAgentsCount(): number;
    maxConcurrentAgents: number;
    readonly browsersById: Map<string, Browser>;
    readonly agentsById: Map<string, Agent>;
    sharedMitmProxy: MitmProxy;
    plugins: IUnblockedPluginClass[];
    protected logger: IBoundLog;
    private isClosing;
    private mitmStartPromise;
    private browserCreationQueue;
    private events;
    private certificateGenerator;
    constructor(options?: ICreatePoolOptions);
    start(): Promise<void>;
    createAgent(options?: IAgentCreateOptions): Agent;
    waitForAvailability(agent: Agent): Promise<void>;
    createMitmProxy(): Promise<MitmProxy>;
    getBrowser(engine: IBrowserEngine, hooks: IHooksProvider & {
        profile?: IEmulationProfile;
    }, launchArgs?: IBrowserUserConfig): Promise<Browser>;
    close(): Promise<void>;
    protected waitForAgentClose(agent: Agent): void;
    private onAgentClosed;
    private startSharedMitm;
    private onBrowserClosed;
    private watchForContextPagesClosed;
    private checkForInactiveBrowserEngine;
    private browserWithEngine;
}
export {};
