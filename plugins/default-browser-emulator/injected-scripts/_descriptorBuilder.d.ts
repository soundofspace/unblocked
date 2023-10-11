declare const nativeErrorRegex: RegExp;
declare const globalSymbols: {};
declare function createError(message: string, type?: {
    new (msg: string): any;
}): Error;
declare function newObjectConstructor(newProps: IDescriptor): () => {};
declare function buildDescriptor(entry: IDescriptor): PropertyDescriptor;
declare function getParentAndProperty(path: string): {
    parent: any;
    property: string;
};
declare function breakdownPath(path: string, propsToLeave: any): {
    parent: any;
    remainder: string[];
};
declare function getObjectAtPath(path: any): any;
declare interface IDescriptor {
    _$flags: string;
    _$type: string;
    _$get?: any;
    _$set?: any;
    _$accessException?: string;
    _$constructorException?: string;
    _$value?: string;
    '_$$value()'?: () => string;
    _$function?: string;
    _$invocation?: string;
    _$protos?: string[];
    'new()'?: IDescriptor;
    prototype: IDescriptor;
}
