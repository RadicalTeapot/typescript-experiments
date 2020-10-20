import { Game } from "./Game";

export class Renderer {
    get ctx() {return this._ctx;}
    /** Size of a tile in pixels*/
    get tileSize() { return 128; };
    /** Scaling factor for renderer objects */
    get scale() { return 2; };

    constructor(game: Game, canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Could not initialize canvas 2D context");

        this._game = game;
        this._canvas = canvas;
        this._ctx = ctx;
    }

    render() {
        this._canvas.width = this._game.grid.width * this.tileSize * this.scale;
        this._canvas.height = this._game.grid.height * this.tileSize * this.scale;
        this._game.grid.render();
    }

    private _game: Game;
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D;
}
