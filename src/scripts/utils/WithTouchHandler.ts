import { GameConstructor } from "./Constructors";

export interface ITouchHandler {
    touchState: { lastPosition: [number, number], isTouching: boolean }
}

class TouchHandler {
    get lastPosition() { return this._lastPosition };
    get isTouching() { return this._isTouching };

    constructor() {
        this._lastPosition = [-1,-1];
        this._isTouching = false;
        this._isAttached = false;

        this.handleTouchDown = this.handleTouchDown.bind(this);
        this.handleTouchUp = this.handleTouchUp.bind(this);
    }

    public attach() {
        if (!this._isAttached) {
            document.addEventListener('touchstart', this.handleTouchDown);
            document.addEventListener('touchend', this.handleTouchUp);
            this._isAttached = true;
        }
    }

    public detach() {
        if (this._isAttached) {
            document.removeEventListener('touchstart', this.handleTouchDown);
            document.removeEventListener('touchend', this.handleTouchUp);
            this._isAttached = false;
        }
    }

    private handleTouchDown(e: TouchEvent) {
        this._lastPosition = [e.touches[0].pageX, e.touches[0].pageY];
        this._isTouching = true;
    }

    private handleTouchUp(e: TouchEvent) {
       this._isTouching = false;
    }

    private _lastPosition: [number, number];
    private _isTouching: boolean;
    private _isAttached: boolean;
}

export const WithTouchHandler = <TBase extends GameConstructor>(Base: TBase) => {
    return class HasTouchHandler extends Base implements ITouchHandler {
        touchState: TouchHandler;

        constructor(...args: any[]) {
            super(...args);
            this.touchState = new TouchHandler();
            this.touchState.attach();
        }
    };
};
