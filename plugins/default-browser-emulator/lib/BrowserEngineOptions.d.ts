import { IVersion } from '@ulixee/unblocked-specification/plugin/IUserAgentOption';
import IBrowserEngineOption from '@ulixee/unblocked-specification/agent/browser/IBrowserEngineOption';
import DataLoader from './DataLoader';
declare type IBrowserEngineOptionAndVersion = IBrowserEngineOption & {
    version: IVersion;
};
export default class BrowserEngineOptions {
    private dataLoader;
    readonly default: IBrowserEngineOptionAndVersion;
    readonly installedOptions: IBrowserEngineOptionAndVersion[];
    private browserIdsNeedingDataFiles;
    constructor(dataLoader: DataLoader, defaultBrowserId: string);
    private getInstalled;
    private checkForInstalled;
    static latestFullVersion(option: IBrowserEngineOption): string;
}
export {};
