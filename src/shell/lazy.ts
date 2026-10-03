// Defers creating a client until it is first used, so importing a module
// never connects anywhere or throws for missing configuration.
export function lazy<T extends object>(create: () => T): T {
  let instance: T | null = null;
  const get = () => (instance ??= create());
  return new Proxy({} as T, {
    get: (_t, prop) => {
      const value = Reflect.get(get(), prop);
      return typeof value === 'function' ? value.bind(get()) : value;
    },
    has: (_t, prop) => prop in get(),
  });
}
