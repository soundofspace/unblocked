let nativeToStringFunctionString = `${Function.toString}`;
const overriddenFns = new Map();
const proxyToTarget = new Map();
const ReflectCached = {
    construct: Reflect.construct.bind(Reflect),
    get: Reflect.get.bind(Reflect),
    set: Reflect.set.bind(Reflect),
    apply: Reflect.apply.bind(Reflect),
    setPrototypeOf: Reflect.setPrototypeOf.bind(Reflect),
    ownKeys: Reflect.ownKeys.bind(Reflect),
    getOwnPropertyDescriptor: Reflect.getOwnPropertyDescriptor.bind(Reflect),
};
const ObjectCached = {
    setPrototypeOf: Object.setPrototypeOf.bind(Object),
    getPrototypeOf: Object.getPrototypeOf.bind(Object),
    defineProperty: Object.defineProperty.bind(Object),
    create: Object.create.bind(Object),
    entries: Object.entries.bind(Object),
    getOwnPropertyDescriptors: Object.getOwnPropertyDescriptors.bind(Object),
    getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor.bind(Object),
};
(function trackProxyInstances() {
    if (typeof self === 'undefined')
        return;
    const descriptor = ObjectCached.getOwnPropertyDescriptor(self, 'Proxy');
    const toString = descriptor.value.toString();
    descriptor.value = new Proxy(descriptor.value, {
        construct(target, argArray, newTarget) {
            try {
                const result = ReflectCached.construct(target, argArray, newTarget);
                if (argArray?.length)
                    proxyToTarget.set(result, argArray[0]);
                return result;
            }
            catch (err) {
                throw cleanErrorStack(err, null, false, true);
            }
        },
    });
    overriddenFns.set(descriptor.value, toString);
    ObjectCached.defineProperty(self, 'Proxy', descriptor);
})();
const fnToStringDescriptor = ObjectCached.getOwnPropertyDescriptor(Function.prototype, 'toString');
const fnToStringProxy = internalCreateFnProxy(Function.prototype.toString, fnToStringDescriptor, (target, thisArg, args) => {
    if (overriddenFns.has(thisArg)) {
        return overriddenFns.get(thisArg);
    }
    const hasSameProto = ObjectCached.getPrototypeOf(Function.prototype.toString).isPrototypeOf(thisArg.toString);
    if (hasSameProto === false) {
        return thisArg.toString(...(args ?? []));
    }
    try {
        return target.apply(thisArg, args);
    }
    catch (error) {
        cleanErrorStack(error, (line, i) => {
            if (i === 1 && line.includes('Object.toString')) {
                const thisProto = ObjectCached.getPrototypeOf(thisArg);
                if (proxyToTarget.has(thisProto) &&
                    (overriddenFns.has(thisProto) || overriddenFns.has(target))) {
                    return line.replace('Object.toString', 'Function.toString');
                }
            }
            return line;
        });
        throw error;
    }
});
ObjectCached.defineProperty(Function.prototype, 'toString', {
    ...fnToStringDescriptor,
    value: fnToStringProxy,
});
let isObjectSetPrototypeOf = false;
const nativeToStringObjectSetPrototypeOfString = `${Object.setPrototypeOf}`;
Object.setPrototypeOf = new Proxy(Object.setPrototypeOf, {
    apply(target, thisArg, argArray) {
        isObjectSetPrototypeOf = true;
        try {
            return ReflectCached.apply(...arguments);
        }
        catch (error) {
            throw cleanErrorStack(error, null, false, true, true);
        }
        finally {
            isObjectSetPrototypeOf = false;
        }
    },
});
overriddenFns.set(Object.setPrototypeOf, nativeToStringObjectSetPrototypeOfString);
var ProxyOverride;
(function (ProxyOverride) {
    ProxyOverride["callOriginal"] = "_____invoke_original_____";
})(ProxyOverride || (ProxyOverride = {}));
function cleanErrorStack(error, replaceLineFn, startAfterSourceUrl = false, stripStartingReflect = false, stripFirstStackLine = false) {
    if (!error.stack)
        return error;
    const split = error.stack.includes('\r\n') ? '\r\n' : '\n';
    const stack = error.stack.split(/\r?\n/);
    const newStack = [];
    for (let i = 0; i < stack.length; i += 1) {
        let line = stack[i];
        if (stripFirstStackLine && i === 1 && line.includes(' at '))
            continue;
        if (stripStartingReflect && line.includes(' Reflect.'))
            continue;
        if (line.includes(sourceUrl)) {
            if (startAfterSourceUrl === true) {
                newStack.length = 1;
            }
            continue;
        }
        if (replaceLineFn)
            line = replaceLineFn(line, i);
        newStack.push(line);
    }
    error.stack = newStack.join(split);
    return error;
}
function proxyConstructor(owner, key, overrideFn) {
    const descriptor = ObjectCached.getOwnPropertyDescriptor(owner, key);
    const toString = descriptor.value.toString();
    descriptor.value = new Proxy(descriptor.value, {
        construct() {
            try {
                const result = overrideFn(...arguments);
                if (result !== ProxyOverride.callOriginal) {
                    return result;
                }
            }
            catch (err) {
                throw cleanErrorStack(err);
            }
            try {
                return ReflectCached.construct(...arguments);
            }
            catch (err) {
                throw cleanErrorStack(err, null, false, true);
            }
        },
    });
    overriddenFns.set(descriptor.value, toString);
    ObjectCached.defineProperty(owner, key, descriptor);
}
function internalCreateFnProxy(targetFn, descriptor, onApply) {
    const toString = targetFn.toString();
    const proxy = new Proxy(targetFn, {
        apply: onApply,
        setPrototypeOf(target, newPrototype) {
            let protoTarget = newPrototype;
            if (newPrototype === proxy || newPrototype?.__proto__ === proxy) {
                protoTarget = target;
            }
            try {
                const caller = isObjectSetPrototypeOf ? ObjectCached : ReflectCached;
                return caller.setPrototypeOf(target, protoTarget);
            }
            catch (error) {
                throw cleanErrorStack(error, null, false, true);
            }
        },
        get(target, p, receiver) {
            if (p === Symbol.hasInstance && receiver === proxy) {
                try {
                    return target[Symbol.hasInstance].bind(target);
                }
                catch (err) {
                    throw cleanErrorStack(err);
                }
            }
            try {
                return ReflectCached.get(target, p, receiver);
            }
            catch (err) {
                throw cleanErrorStack(err, null, false, true);
            }
        },
        set(target, p, value, receiver) {
            if (p === '__proto__') {
                let protoTarget = value;
                if (protoTarget === proxy || protoTarget?.__proto__ === proxy) {
                    protoTarget = target;
                }
                try {
                    return (target.__proto__ = protoTarget);
                }
                catch (error) {
                    throw cleanErrorStack(error);
                }
            }
            try {
                return ReflectCached.set(...arguments);
            }
            catch (err) {
                throw cleanErrorStack(err, null, false, true);
            }
        },
    });
    overriddenFns.set(proxy, toString);
    return proxy;
}
function proxyFunction(thisObject, functionName, overrideFn, overrideOnlyForInstance = false) {
    const descriptorInHierarchy = getDescriptorInHierarchy(thisObject, functionName);
    if (!descriptorInHierarchy) {
        throw new Error(`Could not find descriptor for function: ${String(functionName)}`);
    }
    const { descriptorOwner, descriptor } = descriptorInHierarchy;
    descriptorOwner[functionName] = internalCreateFnProxy(descriptorOwner[functionName], descriptor, (target, thisArg, argArray) => {
        const shouldOverride = overrideOnlyForInstance === false || thisArg === thisObject;
        const overrideFnToUse = shouldOverride ? overrideFn : null;
        return defaultProxyApply([target, thisArg, argArray], overrideFnToUse);
    });
    return thisObject[functionName];
}
function proxyGetter(thisObject, propertyName, overrideFn, overrideOnlyForInstance = false) {
    const descriptorInHierarchy = getDescriptorInHierarchy(thisObject, propertyName);
    if (!descriptorInHierarchy) {
        throw new Error(`Could not find descriptor for getter: ${String(propertyName)}`);
    }
    const { descriptorOwner, descriptor } = descriptorInHierarchy;
    descriptor.get = internalCreateFnProxy(descriptor.get, descriptor, (target, thisArg, argArray) => {
        const shouldOverride = overrideOnlyForInstance === false || thisArg === thisObject;
        const overrideFnToUse = shouldOverride ? overrideFn : null;
        return defaultProxyApply([target, thisArg, argArray], overrideFnToUse);
    });
    ObjectCached.defineProperty(descriptorOwner, propertyName, descriptor);
    return descriptor.get;
}
function proxySetter(thisObject, propertyName, overrideFn, overrideOnlyForInstance = false) {
    const descriptorInHierarchy = getDescriptorInHierarchy(thisObject, propertyName);
    if (!descriptorInHierarchy) {
        throw new Error(`Could not find descriptor for setter: ${String(propertyName)}`);
    }
    const { descriptorOwner, descriptor } = descriptorInHierarchy;
    descriptor.set = internalCreateFnProxy(descriptor.set, descriptor, (target, thisArg, argArray) => {
        if (!overrideOnlyForInstance || thisArg === thisObject) {
            try {
                const result = overrideFn(target, thisArg, ...argArray);
                if (result !== ProxyOverride.callOriginal)
                    return result;
            }
            catch (err) {
                throw cleanErrorStack(err);
            }
        }
        return ReflectCached.apply(target, thisArg, argArray);
    });
    ObjectCached.defineProperty(descriptorOwner, propertyName, descriptor);
    return descriptor.set;
}
function defaultProxyApply(args, overrideFn) {
    if (overrideFn) {
        try {
            const result = overrideFn(...args);
            if (result !== ProxyOverride.callOriginal) {
                if (result && result.then && result.catch) {
                    return result.catch(err => {
                        throw cleanErrorStack(err);
                    });
                }
                return result;
            }
        }
        catch (err) {
            throw cleanErrorStack(err);
        }
    }
    return ReflectCached.apply(...args);
}
function getDescriptorInHierarchy(obj, prop) {
    let proto = obj;
    do {
        if (!proto)
            return null;
        if (proto.hasOwnProperty(prop)) {
            return {
                descriptorOwner: proto,
                descriptor: ObjectCached.getOwnPropertyDescriptor(proto, prop),
            };
        }
        proto = ObjectCached.getPrototypeOf(proto);
    } while (proto);
    return null;
}
function addDescriptorAfterProperty(path, prevProperty, propertyName, descriptor) {
    const owner = getObjectAtPath(path);
    if (!owner) {
        console.log(`ERROR: Parent for property descriptor not found: ${path} -> ${propertyName}`);
        return;
    }
    const descriptors = ObjectCached.getOwnPropertyDescriptors(owner);
    if (descriptors[propertyName]) {
        return;
    }
    const inHierarchy = getDescriptorInHierarchy(owner, propertyName);
    if (inHierarchy && descriptor.value) {
        if (inHierarchy.descriptor.get) {
            proxyGetter(owner, propertyName, () => descriptor.value, true);
        }
        else {
            throw new Error("Can't override descriptor that doesnt have a getter");
        }
        return;
    }
    let hasPassedProperty = false;
    for (const [key, existingDescriptor] of ObjectCached.entries(descriptors)) {
        if (hasPassedProperty) {
            delete owner[key];
            ObjectCached.defineProperty(owner, key, existingDescriptor);
        }
        if (key === prevProperty) {
            ObjectCached.defineProperty(owner, propertyName, descriptor);
            hasPassedProperty = true;
        }
    }
}
if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = {
        proxyFunction,
    };
}
