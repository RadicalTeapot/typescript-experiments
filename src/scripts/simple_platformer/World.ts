import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";
import { Tile } from "./Tile";

export class World {
    tiles:  (Tile | undefined)[];
    get height() {return this._height};
    get width() {return this._width};
    get map() {return this._map};

    /** Create level from string array */
    constructor(game: Game) {
        this._height = 0;
        this._width = 0;
        this._map = [];
        this.tiles = [];
        this._game = game;
    }

    setMap(...map: string[]) {
        this._height = map.length;
        this._width = map[0].length;
        this._map = map;
        this.tiles = [];
        map.forEach((row, y) => row.split("").forEach((cell, x) => this.tiles[x+y*this._width] = cell === 'x' ? new Tile([x, y], 'tileTop') : undefined));
    }

    findTile(x: number, y: number) {
        return this.tiles[x + y * this._width];
    }

    /** Render level tiles */
    render() {
        // Dirty scale but works for now
        this.tiles.forEach(tile => {
            if (tile !== undefined && this._game.assets.has(AssetType.IMAGE, tile.spriteName))
                this._game.renderer.ctx.drawImage(
                    this._game.assets.get(AssetType.IMAGE, tile.spriteName),
                    tile.x * this._game.renderer.tileSize, tile.y * this._game.renderer.tileSize,
                    this._game.renderer.tileSize, this._game.renderer.tileSize
                );
        });
    }

    private _height: number;
    private _width: number;
    private _map: string[];
    private _game: Game;
}
