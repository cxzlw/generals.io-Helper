export {};

declare global {
  interface Window {
    wrappedJSObject: Window & typeof globalThis;
  }

  function cloneInto<T>(obj: T, target: object, options?: object): T;
  function exportFunction<T>(obj: T, target: object): T;
}
