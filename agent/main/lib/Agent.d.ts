import '@ulixee/commons/lib/SourceMapSupport';
import { RequestSession } from '@ulixee/unblocked-agent-mitm';
import { IBoundLog } from '@ulixee/commons/interfaces/ILog';
import { TypedEventEmitter } from '@ulixee/commons/lib/eventUtils';
import { IHooksProvider } from '@ulixee/unblocked-specification/agent/hooks/IHooks';
import IEmulationProfile, { IEmulationOptions } from '@ulixee/unblocked-specification/plugin/IEmulationProfile';
import { IUnblockedPluginClass } from '@ulixee/unblocked-specification/plugin/IUnblockedPlugin';
import Plugins from './Plugins';
import ICommandMarker from '../interfaces/ICommandMarker';
import Page from './Page';
import Browser from './Browser';
import Pool from './Pool';
import BrowserContext from './BrowserContext';
export interface IAgentCreateOptions extends Omit<IEmulationProfile, keyof IEmulationOptions> {
    id?: string;
    plugins?: IUnblockedPluginClass[];
    commandMarker?: ICommandMarker;
}
export default class Agent extends TypedEventEmitter<{
    close: void;
}> {
    private readonly options;
    readonly pool?: Pool;
    readonly id: string;
    browserContext: BrowserContext;
    readonly mitmRequestSession: RequestSession;
    readonly logger: IBoundLog;
    readonly plugins: Plugins;
    get emulationProfile(): IEmulationProfile;
    get isIncognito(): boolean;
    private isOpen;
    private isClosing;
    private events;
    private readonly enableMitm;
    private readonly closeBrowserOnClose;
    private isolatedMitm;
    private get proxyConnectionInfo();
    constructor(options?: IAgentCreateOptions, pool?: Pool);
    open(): Promise<BrowserContext>;
    newPage(): Promise<Page>;
    hook(hooks: IHooksProvider): this;
    close(): Promise<void>;
    protected createBrowserContext(browser: Browser): Promise<BrowserContext>;
    private cleanup;
}
