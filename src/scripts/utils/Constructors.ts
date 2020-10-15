// Note: Mixins implementation is based on this https://mariusschulz.com/blog/mixin-classes-in-typescript
// and this https://www.typescriptlang.org/docs/handbook/mixins.html

export type Constructor<T = {}> = new (...args: any[]) => T;
export type GameBaseClass = {update(): void, render(): void};
export type GameConstructor<T = GameBaseClass> = new(...args: any[]) => T;
