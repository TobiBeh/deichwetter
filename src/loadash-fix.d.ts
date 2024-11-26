declare module 'lodash' {
    const debounce: <T extends (...args: any[]) => any>(
      func: T,
      wait: number
    ) => T;
    export { debounce };
  }
  