declare module "bun:test" {
  interface Mock<T extends (...args: unknown[]) => unknown = (...args: unknown[]) => unknown> {
    (...args: Parameters<T>): ReturnType<T>;
    toHaveBeenCalledTimes(n: number): void;
    toHaveBeenCalledWith(...args: unknown[]): void;
  }

  type TestFn = (name: string, fn: () => void | Promise<void>) => void;
  type TestEach = <T extends unknown[]>(
    table: readonly T[]
  ) => (name: string, fn: (...args: T) => void | Promise<void>) => void;

  export function describe(name: string, fn: () => void): void;
  export const test: TestFn & { each: TestEach };
  export function beforeEach(fn: () => void | Promise<void>): void;
  export function afterEach(fn: () => void | Promise<void>): void;
  export function mock<T extends (...args: unknown[]) => unknown>(fn?: T): Mock<T>;
  export const expect: (value: unknown) => {
    toBe(expected: unknown): void;
    not: { toThrow(): void };
    toHaveBeenCalledTimes(n: number): void;
    toHaveBeenCalledWith(...args: unknown[]): void;
  };
}
