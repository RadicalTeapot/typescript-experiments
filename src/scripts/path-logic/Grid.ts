import { AssetType } from "../utils/AssetLoader";
import { TiledLayer, TiledMap } from "../utils/TiledJSONParser";
import { Game } from "./Game";

class GridTile {
    x: number;
    y: number;
    tileID: string;

    constructor(x: number, y: number, tileID: string) {
        this.x = x;
        this.y = y;
        this.tileID = tileID;
    }
}

export class Grid {
    get width() { return this._width };
    get height() { return this._height };

    constructor(game: Game) {
        this._game = game;
        this._layers = [];
        this._width = 0;
        this._height = 0;
        this._interactiveLayerIndex = -1;
    }

    public setMap(map: TiledMap) {
        this._width = map.width;
        this._height = map.height;

        // Fill layers
        let tileLayers = this.extractTileLayers(map);
        this._layers = tileLayers.filter(layer=> layer.data && layer.data.length > 0).map(layer => {
            let layerData: GridTile[] = [];
            let x = 0, y = 0;
            layer.data!.forEach((tileID, index) => {
                if (tileID > 0) {
                    x = index % this._width;
                    y = Math.floor(index / this._width);
                    layerData[x + y * this.width] = new GridTile(x, y, tileID.toString());
                }
            })
            return layerData;
        })
    }

    public render() {
        this.renderLayers();
        this.renderGrid();
    }

    public getInteractiveTile(x: number, y: number) {
        return this._layers[this._interactiveLayerIndex][x + y * this.width];
    }

    public setTileID(x: number, y: number, tileID: string) {
        const tile = this.getInteractiveTile(x, y);
        if (tile)
            tile.tileID = tileID;
    }

    /** Use depth first search so returned layers should ordered properly */
    private extractTileLayers(map: TiledMap): TiledLayer[] {
        let layers: TiledLayer[] = [];
        const getTileLayers = (layer: TiledLayer) => {
            if (layer.type === 'tilelayer' && this.isLayerRenderable(layer))
            {
                layers.push(layer);
                if (this.isLayerInteractive(layer))
                    this._interactiveLayerIndex = layers.length - 1;
            }
            else if (layer.type === 'group')
                layer.layers?.forEach(child => getTileLayers(child));
        };
        map.layers.forEach(child => getTileLayers(child));
        return layers;
    }

    private isLayerRenderable(layer: TiledLayer): boolean {
        let renderable = false;
        if (layer.properties && layer.properties.length > 0)
            renderable = layer.properties.some(property => property.name === "renderable" && property.type === "bool" && property.value === true);
        return renderable;
    }

    private isLayerInteractive(layer: TiledLayer): boolean {
        let interactive = false;
        if (layer.properties && layer.properties.length > 0)
            interactive = layer.properties.some(property => property.name === "interactive" && property.type === "bool" && property.value === true);
        return interactive;
    }

    private renderLayers() {
        if (this._layers.length > 0) {
            this._layers.forEach(layer =>
                layer.filter(tile => this.isTileValid(tile)).forEach(tile =>
                    this._game.renderer.ctx.drawImage(
                        this._game.assets.get(AssetType.IMAGE, tile.tileID),
                        tile.x * this._game.renderer.tileSize,
                        tile.y * this._game.renderer.tileSize,
                        this._game.renderer.tileSize, this._game.renderer.tileSize
                    )
                )
            )
        }
    }

    private isTileValid(tile: GridTile) {
        return this._game.assets.has(AssetType.IMAGE, tile.tileID);
    }

    private renderGrid() {
        this._game.renderer.ctx.strokeStyle = "rgba(0,0,0,0.25)";

        this._game.renderer.ctx.beginPath();
        for (let i = 0; i < this.width; i++) {
            this._game.renderer.ctx.moveTo(i * this._game.renderer.tileSize, 0);
            this._game.renderer.ctx.lineTo(i * this._game.renderer.tileSize, this.height * this._game.renderer.tileSize);
        }
        for (let i = 0; i < this.height; i++) {
            this._game.renderer.ctx.moveTo(0, i * this._game.renderer.tileSize);
            this._game.renderer.ctx.lineTo(this.width * this._game.renderer.tileSize, i * this._game.renderer.tileSize);
        }
        this._game.renderer.ctx.stroke();
    }

    private _layers: GridTile[][];
    private _interactiveLayerIndex: number;
    private _width: number;
    private _height: number;
    private _game: Game;
}
