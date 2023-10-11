import { TypedEventEmitter } from '@ulixee/commons/lib/eventUtils';
import Protocol from 'devtools-protocol';
import { IWorker, IWorkerEvents } from '@ulixee/unblocked-specification/agent/browser/IWorker';
import { IBoundLog } from '@ulixee/commons/interfaces/ILog';
import BrowserContext from './BrowserContext';
import DevtoolsSession from './DevtoolsSession';
import NetworkManager from './NetworkManager';
import TargetInfo = Protocol.Target.TargetInfo;
export declare class Worker extends TypedEventEmitter<IWorkerEvents> implements IWorker {
    readonly browserContext: BrowserContext;
    isReady: Promise<Error | null>;
    get isInitializationSent(): Promise<void>;
    hasLoadedResponse: boolean;
    readonly devtoolsSession: DevtoolsSession;
    protected readonly logger: IBoundLog;
    private readonly initializationSent;
    private readonly networkManager;
    private readonly targetInfo;
    private readonly events;
    private readonly executionContextId;
    get id(): string;
    get url(): string;
    get type(): IWorker['type'];
    constructor(browserContext: BrowserContext, parentNetworkManager: NetworkManager, devtoolsSession: DevtoolsSession, logger: IBoundLog, targetInfo: TargetInfo);
    initialize(pageNetworkManager: NetworkManager): Promise<void>;
    evaluate<T>(expression: string, isInitializationScript?: boolean): Promise<T>;
    close(): void;
    toJSON(): unknown;
    private initializeEmulation;
    private resumeAfterEmulation;
    private onContextCreated;
    private onRuntimeException;
    private onRuntimeConsole;
}
