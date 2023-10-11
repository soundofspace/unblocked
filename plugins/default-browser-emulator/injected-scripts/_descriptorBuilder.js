const nativeErrorRegex = new RegExp(/^(\w+):\s/);
const globalSymbols = {};
for (const symbol of ReflectCached.ownKeys(Symbol)) {
    if (typeof Symbol[symbol] === 'symbol') {
        globalSymbols[`${String(Symbol[symbol])}`] = Symbol[symbol];
    }
}
function createError(message, type) {
    if (!type) {
        const match = nativeErrorRegex.exec(message);
        if (match.length) {
            message = message.replace(`${match[1]}: `, '');
            try {
                type = self[match[1]];
            }
            catch (err) {
            }
        }
    }
    if (!type)
        type = Error;
    const errType = new type(message);
    return cleanErrorStack(errType);
}
function newObjectConstructor(newProps) {
    return function () {
        if (newProps._$constructorException) {
            throw createError(newProps._$constructorException);
        }
        Object.setPrototypeOf(this, getObjectAtPath(newProps._$protos[0]));
        const props = Object.entries(newProps);
        const obj = {};
        for (const [prop, value] of props) {
            if (prop.startsWith('_$'))
                continue;
            let propName = prop;
            if (propName.startsWith('Symbol(')) {
                propName = Symbol.for(propName.match(/Symbol\((.+)\)/)[1]);
            }
            Object.defineProperty(obj, propName, buildDescriptor(value));
        }
        return obj;
    };
}
function buildDescriptor(entry) {
    const attrs = {};
    const flags = entry._$flags || '';
    if (flags.includes('c'))
        attrs.configurable = true;
    if (flags.includes('w'))
        attrs.writable = true;
    if (flags.includes('e'))
        attrs.enumerable = true;
    if (entry._$get) {
        attrs.get = new Proxy(Function.prototype.call.bind({}), {
            apply() {
                if (entry._$accessException)
                    throw createError(entry._$accessException);
                if (entry._$value)
                    return entry._$value;
                if (entry['_$$value()'])
                    return entry['_$$value()']();
            },
        });
        overriddenFns.set(attrs.get, entry._$get);
    }
    else if (entry['_$$value()']) {
        attrs.value = entry['_$$value()']();
    }
    else if (entry._$value !== undefined) {
        attrs.value = entry._$value;
    }
    if (entry._$set) {
        attrs.set = new Proxy(Function.prototype.call.bind({}), {
            apply() { },
        });
        overriddenFns.set(attrs.set, entry._$set);
    }
    if (entry._$function) {
        const newProps = entry['new()'];
        if (!newProps) {
            attrs.value = new Proxy(Function.prototype.call.bind({}), {
                apply() {
                    return entry._$invocation;
                },
            });
        }
        else {
            attrs.value = newObjectConstructor(newProps);
        }
        if (entry._$invocation !== undefined) {
            Object.setPrototypeOf(attrs.value, Function.prototype);
            delete attrs.value.prototype;
            delete attrs.value.constructor;
        }
        overriddenFns.set(attrs.value, entry._$function);
    }
    if (typeof entry === 'object') {
        const props = Object.entries(entry).filter(([prop]) => !prop.startsWith('_$'));
        if (!attrs.value && (props.length || entry._$protos)) {
            attrs.value = {};
        }
        if (entry._$protos) {
            attrs.value = Object.setPrototypeOf(attrs.value, getObjectAtPath(entry._$protos[0]));
        }
        for (const [prop, value] of props) {
            if (prop.startsWith('_$'))
                continue;
            if (prop === 'arguments' || prop === 'caller')
                continue;
            let propName = prop;
            if (propName.startsWith('Symbol(')) {
                propName = globalSymbols[propName];
                if (!propName) {
                    const symbolName = propName.match(/Symbol\((.+)\)/)[1];
                    propName = Symbol.for(symbolName);
                }
            }
            const descriptor = buildDescriptor(value);
            if (propName === 'prototype') {
                Object.defineProperty(descriptor.value, 'constructor', {
                    value: newObjectConstructor(value),
                    writable: true,
                    enumerable: false,
                    configurable: true,
                });
                if (!entry.prototype._$flags || !entry.prototype._$flags.includes('w')) {
                    descriptor.writable = false;
                }
                if (entry._$function) {
                    overriddenFns.set(descriptor.value.constructor, entry._$function);
                }
            }
            Object.defineProperty(attrs.value, propName, descriptor);
        }
    }
    return attrs;
}
function getParentAndProperty(path) {
    const parts = breakdownPath(path, 1);
    if (!parts)
        return undefined;
    return { parent: parts.parent, property: parts.remainder[0] };
}
function breakdownPath(path, propsToLeave) {
    if (!path || path.startsWith('detached')) {
        return undefined;
    }
    const parts = path.split(/\.Symbol\(([\w.]+)\)|\.(\w+)/).filter(Boolean);
    let obj = self;
    while (parts.length > propsToLeave) {
        let next = parts.shift();
        if (next === 'window')
            continue;
        if (next.startsWith('Symbol.'))
            next = Symbol.for(next);
        obj = obj[next];
        if (!obj) {
            throw new Error(`Property not found -> ${path} at ${String(next)}`);
        }
    }
    return { parent: obj, remainder: parts };
}
function getObjectAtPath(path) {
    const parts = breakdownPath(path, 0);
    if (!parts)
        return undefined;
    return parts.parent;
}
