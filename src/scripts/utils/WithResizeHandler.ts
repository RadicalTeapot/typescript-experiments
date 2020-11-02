import { Constructor } from "./Constructors";

export type ResizableCallback = (width: number, height: number) => void
class ResizeHandler {
    constructor(callback: ResizableCallback) {
        this._attached = false;
        this._resizeCallback = callback;
        this.handleResize = this.handleResize.bind(this);
    }

    public attach() {
        if (!this._attached) {
            window.addEventListener('resize', this.handleResize)
            this._attached = true;
        }
    }

    public detach() {
        if (this._attached) {
            window.removeEventListener('resize', this.handleResize);
            this._attached = false;
        }
    }

    private handleResize(ev: UIEvent) {
        this._resizeCallback(innerWidth, innerHeight);
    }

    private _attached: boolean;
    private _resizeCallback: ResizableCallback;
}

export const WithResizeHandler = <TBase extends Constructor>(Base: TBase) => {
    abstract class HasResizeHandler extends Base {
        constructor(...args: any[]) {
            super(...args);
            this._resizeHandler = new ResizeHandler(this.handleResize.bind(this));
            this._resizeHandler.attach();
        }
        abstract handleResize(width: number, height: number): void;
        protected _resizeHandler: ResizeHandler;
    }

    return HasResizeHandler;
}
