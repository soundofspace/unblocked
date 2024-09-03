export type Args = {
  preventDefaultUncaughtError: boolean;
  preventDefaultUnhandledRejection: boolean;
};

const typedArgs = args as Args;

if (typedArgs.preventDefaultUncaughtError) {
  self.addEventListener('error', preventDefault);
}
if (typedArgs.preventDefaultUnhandledRejection) {
  self.addEventListener('unhandledrejection', preventDefault);
}

function preventDefault(event: ErrorEvent | PromiseRejectionEvent) {
  event.preventDefault();

  // Hide this, but make sure if they hide it we mimic normal behaviour
  let prevented = event.defaultPrevented;
  replaceFunction(
    event,
    'preventDefault',
    (target, thisArg, argArray) => {
      // Will raise correct error if 'thisArg' is wrong
      ReflectCached.apply(target, thisArg, argArray);
      prevented = true;
    },
    { onlyForInstance: true },
  );
  replaceGetter(
    event,
    'defaultPrevented',
    (target, thisArg) => {
      ReflectCached.get(target, thisArg);
      return prevented;
    },
    { onlyForInstance: true },
  );

  if (!('console' in self)) {
    return;
  }

  const error = event instanceof ErrorEvent ? event.error : event.reason;
  self.console.error(`Default ${event.type} event prevented, error:`, error);
}
