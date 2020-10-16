import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

export class Renderer {
    /** 2D Context */
    ctx: CanvasRenderingContext2D;
    private _canvas: HTMLCanvasElement;
    private _game: Game;
    /** Size of a tile in pixels*/
    get tileSize() { return 32; };
    /** Scaling factor for renderer objects */
    get scale() { return 2; };
    debug: boolean;

    constructor(game: Game, canvas: HTMLCanvasElement) {
        const ctx = canvas.getContext("2d");
        if (!ctx)
            throw new Error("Could not initialize canvas 2D context");

        this._game = game;
        this._canvas = canvas;
        this.ctx = ctx;
        this.debug = false;
    }

    /** Render background */
    background() {
        if (this._game.assets.has(AssetType.IMAGE, 'bgBackground')) {
            this.ctx.fillStyle = this.ctx.createPattern(this._game.assets.get(AssetType.IMAGE, 'bgBackground'), 'repeat') ?? "";
            this.ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
        // Tiles
        if (this._game.assets.has(AssetType.IMAGE, 'bgTiles')) {
            this.ctx.fillStyle = this.ctx.createPattern(this._game.assets.get(AssetType.IMAGE, 'bgTiles'), 'repeat-x') ?? "";
            this.ctx.save();
            this.ctx.translate(0, this._canvas.height - this._game.assets.get(AssetType.IMAGE, 'bgTiles').height);
            this.ctx.fillRect(0, 0, this._canvas.width, this._game.assets.get(AssetType.IMAGE, 'bgTiles').height);
            this.ctx.restore();
        }
        // Hills
        if (this._game.assets.has(AssetType.IMAGE, 'bgHills')) {
            this.ctx.fillStyle = this.ctx.createPattern(this._game.assets.get(AssetType.IMAGE, 'bgHills'), 'repeat-x') ?? "";
            this.ctx.save();
            this.ctx.translate(0, this._canvas.height - this._game.assets.get(AssetType.IMAGE, 'bgHills').height);
            this.ctx.fillRect(0, 0, this._canvas.width, this._game.assets.get(AssetType.IMAGE, 'bgHills').height);
            this.ctx.restore();
        }
    }

    /** Render helpers used for debugging purposes */
    renderHelpers() {
        if (this.debug) {
            let i;
            this.ctx.strokeStyle = '#F005';
            this.ctx.beginPath();
            for (i = 0; i < this._game.world.width; i++) {
                this.ctx.moveTo(i * this.tileSize, 0);
                this.ctx.lineTo(i * this.tileSize, this._game.world.height * this.tileSize);
            }
            for (i = 0; i < this._game.world.height; i++) {
                this.ctx.moveTo(0, i * this.tileSize);
                this.ctx.lineTo(this._game.world.width * this.tileSize, i * this.tileSize);
            }
            this.ctx.stroke();
        }
    }

    /** Render a frame */
    render() {
        // Reset canvas size
        this._canvas.width = this._game.world.width * this.tileSize * this.scale;
        this._canvas.height = this._game.world.height * this.tileSize * this.scale;
        // Draw background
        this.background();
        // Scale objects
        this.ctx.scale(this.scale, this.scale);
        // Render tiles
        this._game.world.render();
        // Render player
        //Player.render(this.ctx);
        this.renderHelpers();
    }
}
