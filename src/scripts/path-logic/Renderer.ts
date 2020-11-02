import { Game } from "./Game";

export class Renderer {
    get canvas() { return this._canvas; }
    get ctx() { return this._ctx; }
    /** Size of a tile in pixels*/
    get tileSize() { return 128; };
    get width() { return this._canvas.width };
    get height() { return this._canvas.height };

    constructor(game: Game, canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Could not initialize canvas 2D context");

        this._game = game;
        this._canvas = canvas;
        this._canvas.width = innerWidth;
        this._canvas.height = innerHeight;
        this._ctx = ctx;
    }

    render() {
        this._canvas.width = innerWidth;
        this._canvas.height = innerHeight;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this._game.state.render();
    }

    private _game: Game;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
}
