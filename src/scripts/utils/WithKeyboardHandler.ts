import { GameConstructor } from "./Constructors";

export interface IKeyboardHandler {
    keys: { up: boolean, right: boolean, left: boolean }
}

class KeyboardHandler {
    get up() { return this._up };
    get left() { return this._left };
    get right() { return this._right };

    constructor() {
        this._up = false;
        this._left = false;
        this._right = false;
        this._isAttached = false;

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
    }

    public attach() {
        if (!this._isAttached) {
            document.addEventListener('keydown', this.handleKeyDown);
            document.addEventListener('keyup', this.handleKeyUp);
            this._isAttached = true;
        }
    }

    public detach() {
        if (this._isAttached) {
            document.removeEventListener('keydown', this.handleKeyDown);
            document.removeEventListener('keyup', this.handleKeyUp);
            this._isAttached = false;
        }
    }

    private handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowLeft": this._left = true; break;
            case "ArrowRight": this._right = true; break;
            case "ArrowUp": this._up = true; break;
        }
    }

    private handleKeyUp(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowLeft": this._left = false; break;
            case "ArrowRight": this._right = false; break;
            case "ArrowUp": this._up = false; break;
        }
    }

    private _left: boolean;
    private _right: boolean;
    private _up: boolean;
    private _isAttached: boolean;
}

export const WithKeyboardHandler = <TBase extends GameConstructor>(Base: TBase) => {
    return class HasKeyboardHandler extends Base implements IKeyboardHandler {
        keys: KeyboardHandler;

        constructor(...args: any[]) {
            super(...args);
            this.keys = new KeyboardHandler();
            this.keys.attach();
        }
    };
};
