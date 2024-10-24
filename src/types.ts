export type AsyncFunction<T extends T[], R = unknown> = (...args: T)=> Promise<R>;
export type Function<T extends T[], R = unknown> = (...args: T)=> R;
export type AnyFunction<T extends T[], R = unknown> = AsyncFunction<T, R> | Function<T, R>;
