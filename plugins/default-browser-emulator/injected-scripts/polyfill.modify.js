for (const itemToModify of args.itemsToModify || []) {
    try {
        if (itemToModify.propertyName === '_$function') {
            const func = getObjectAtPath(itemToModify.path);
            overriddenFns.set(func, itemToModify.property);
        }
        if (itemToModify.propertyName === '_$setToStringToString' ||
            itemToModify.propertyName === '_$getToStringToString') {
            nativeToStringFunctionString = itemToModify.property;
            continue;
        }
        const parts = getParentAndProperty(itemToModify.path);
        const property = parts.property;
        const parent = parts.parent;
        const descriptorInHierarchy = getDescriptorInHierarchy(parent, property);
        if (!descriptorInHierarchy) {
            console.warn('Descriptor not found for polyfill', itemToModify);
            continue;
        }
        const { descriptor } = descriptorInHierarchy;
        if (itemToModify.propertyName === '_$value') {
            if (descriptor.get) {
                descriptor.get = proxyGetter(parent, property, () => itemToModify.property);
            }
            else {
                descriptor.value = itemToModify.property;
                Object.defineProperty(parent, property, descriptor);
            }
        }
        else if (itemToModify.propertyName === '_$get') {
            overriddenFns.set(descriptor.get, itemToModify.property);
        }
        else if (itemToModify.propertyName === '_$set') {
            overriddenFns.set(descriptor.set, itemToModify.property);
        }
        else if (itemToModify.propertyName.startsWith('_$otherInvocation')) {
            const ReflectCachedHere = ReflectCached;
            const invocationReturnOrThrowHere = invocationReturnOrThrow;
            const OtherInvocationsTrackerHere = OtherInvocationsTracker;
            if (!OtherInvocationsTracker.basePaths.has(itemToModify.path)) {
                proxyFunction(parent, property, (target, thisArg, argArray) => {
                    const { invocation, isAsync } = OtherInvocationsTrackerHere.getOtherInvocation(itemToModify.path, thisArg);
                    return invocation !== undefined
                        ? invocationReturnOrThrowHere(invocation, isAsync)
                        : ReflectCachedHere.apply(target, thisArg, argArray);
                });
            }
            const otherPath = itemToModify.propertyName.split('.').slice(0, -1).join('.');
            OtherInvocationsTracker.addOtherInvocation(itemToModify.path, otherPath, itemToModify.property);
        }
    }
    catch (err) {
        console.log(`WARN: error changing prop ${itemToModify.path}.${itemToModify.propertyName}\n${err.stack}`);
    }
}
PathToInstanceTracker.updateAllReferences();
