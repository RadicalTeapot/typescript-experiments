import { Game } from "./Game";

export class Renderer {
    get canvas() { return this._canvas; }
    get ctx() { return this._ctx; }
    /** Size of a tile in pixels*/
    get tileSize() { return 128; };
    get scale() { return this._scale; }

    constructor(game: Game, canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Could not initialize canvas 2D context");

        this._game = game;
        this._canvas = canvas;
        this._ctx = ctx;
    }

    render() {
        this._scale = innerHeight / (this.tileSize * this._game.currentLevel.height);
        this._canvas.width = this._game.currentLevel.width * this.tileSize * this._scale;
        this._canvas.height = this._game.currentLevel.height * this.tileSize * this._scale;
        this.ctx.scale(this._scale, this._scale);
        this._game.currentLevel.render();
    }

    private _game: Game;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
    private _scale: number = 1;
}
