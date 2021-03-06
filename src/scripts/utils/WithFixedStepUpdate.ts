import { GameConstructor } from "./Constructors";

export interface IFixedStepUpdate {
    run: () => void
};

export const WithFixedStepUpdate = <TBase extends GameConstructor>(Base: TBase) => {
    return class HasFixedStep extends Base implements IFixedStepUpdate {
        constructor(...args: any[]) {
            super(...args);
            this._step = 1 / 60;
            this._gdt = 0;
            this._now = 0;
            this.frame = this.frame.bind(this);
        }

        public run() {
            requestAnimationFrame(this.frame);
        }

        private frame(t: number) {
            this._now = t;
            this._last = this._last || (t - this._step * 1000);
            var dt = Math.min((this._now - this._last) / 1000, 1);
            this._gdt += dt;
            while (this._gdt >= dt) {
                // Update physics at fixed rate
                this.update();
                this._gdt -= dt;
            }
            // Render frame
            this.render();
            this._last = this._now;
            requestAnimationFrame(this.frame);
        }

        private _step: number;
        private _gdt: number;
        private _now: number
        private _last?: number;
    }
}
