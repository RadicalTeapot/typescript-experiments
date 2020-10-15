export type Constructor<T = {}> = new (...args: any[]) => T;
export type GameBaseClass = {update(): void, render(): void};
export type GameConstructor<T = GameBaseClass> = new(...args: any[]) => T;
