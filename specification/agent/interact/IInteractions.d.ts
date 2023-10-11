import IMouseResult from './IMouseResult';
import { IJsPath } from '@ulixee/js-path';
import IPoint from '../browser/IPoint';
import { IKeyboardShortcut } from "./IKeyboardShortcuts";
import { IKeyboardKeyCode } from "./IKeyboardLayoutUS";
export declare type IElementInteractVerification = 'elementAtPath' | 'exactElement' | 'none';
export declare type IInteractionGroups = IInteractionGroup[];
export declare type IInteractionGroup = IInteractionStep[];
export interface IInteractionStep {
    command: IInteractionCommand;
    mousePosition?: IMousePosition;
    mouseButton?: IMouseButton;
    mouseResultVerifier?: () => Promise<IMouseResult>;
    simulateOptionClickOnNodeId?: number;
    keyboardCommands?: IKeyboardCommand[];
    keyboardDelayBetween?: number;
    keyboardKeyupDelay?: number;
    delayNode?: IJsPath;
    delayElement?: IJsPath;
    delayMillis?: number;
    verification?: IElementInteractVerification;
    relativeToScrollOffset?: IPoint;
}
export declare enum InteractionCommand {
    move = "move",
    scroll = "scroll",
    willDismissDialog = "willDismissDialog",
    click = "click",
    clickDown = "clickDown",
    clickUp = "clickUp",
    doubleclick = "doubleclick",
    type = "type",
    waitForMillis = "waitForMillis"
}
export declare type IInteractionCommand = keyof typeof InteractionCommand;
export declare enum MouseButton {
    left = "left",
    middle = "middle",
    right = "right"
}
export declare type IMouseButton = keyof typeof MouseButton;
export declare type IMousePositionXY = [number, number];
export declare function isMousePositionXY(mousePosition: any): boolean;
export declare type IMousePosition = IMousePositionXY | IJsPath;
export declare type IKeyboardCommand = IKeyPress | IKeyboardObject;
export declare type IKeyboardObject = IKeyboardString | IKeyboardUp | IKeyboardDown | IKeyShortcutPress;
export interface IKeyboardString {
    string: string;
}
export interface IKeyPress {
    keyCode: IKeyboardKeyCode;
}
export interface IKeyShortcutPress {
    shortcut: IKeyboardShortcut;
}
export interface IKeyboardUp {
    up: IKeyboardKeyCode;
}
export interface IKeyboardDown {
    down: IKeyboardKeyCode;
}
