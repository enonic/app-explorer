// error  Don't use `{}` as a type. `{}` actually means "any non-nullish value".
// - If you want a type meaning "any object", you probably want `Record<string, unknown>` instead.
// - If you want a type meaning "any value", you probably want `unknown` instead.
// - If you want a type meaning "empty object", you probably want `Record<string, never>` instead  @typescript-eslint/ban-types
export type AnyObject = Record<string, unknown>;
export type EmptyObject = Record<string, never>;
