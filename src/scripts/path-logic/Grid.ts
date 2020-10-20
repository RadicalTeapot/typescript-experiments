import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

class Tile {
    x: number;
    y: number;
    spriteID: string = "";

    constructor(x: number, y: number, spriteID: string) {
        this.x = x;
        this.y = y;
        this.spriteID = spriteID;
    }
}

export class Grid {
    get width() {return 5};
    get height() {return 5};

    constructor(game: Game) {
        this._game = game;
        this._tiles = [];
        let x: number, y: number;
        for (let i = 0; i < this.width * this.height; i++) {
            x = i % this.width; y = Math.floor(i/this.width);
            this._tiles[x + y * this.width] = new Tile(x, y, Math.random() > 0.5 ? 'grass' : 'grassAlt');
        }
    }

    public render() {
        this._tiles.forEach(tile => {
            if (this._game.assets.has(AssetType.IMAGE, tile.spriteID)) {
                this._game.renderer.ctx.drawImage(
                    this._game.assets.get(AssetType.IMAGE, tile.spriteID),
                    tile.x * this._game.renderer.tileSize,
                    tile.y * this._game.renderer.tileSize,
                    this._game.renderer.tileSize, this._game.renderer.tileSize
                )
            }
        });
    }

    public getTile(x: number, y: number) {
        return this._tiles[x + y * this.width];
    }

    public setTileType(x: number, y: number, tileType: string) {
        const tile = this.getTile(x, y);
        if (tile) {
            tile.spriteID = tileType;
        }
    }

    private _tiles: Tile[];
    private _game: Game;
}
