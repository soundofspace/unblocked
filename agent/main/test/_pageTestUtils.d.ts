import { Page } from '../index';
import Frame from '../lib/Frame';
import INodeVisibility from '@ulixee/js-path/interfaces/INodeVisibility';
export declare function attachFrame(pageOrFrame: Page | Frame, frameId: string, url: string): Promise<Frame>;
export declare function setContent(page: Page, content: string): Promise<void>;
export declare function detachFrame(pageOrFrame: Page | Frame, frameId: string): Promise<void>;
export declare function navigateFrame(pageOrFrame: Page | Frame, frameId: string, url: string): Promise<void>;
export declare function waitForVisible(frame: Frame, selector: string): Promise<INodeVisibility>;
