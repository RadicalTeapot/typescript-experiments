import { AssetType } from "../utils/AssetLoader";
import { TiledLayer, TiledMap } from "../utils/TiledJSONParser";
import { Game } from "./Game";

class LevelTile {
    x: number;
    y: number;
    tileID: string;

    constructor(x: number, y: number, tileID: string) {
        this.x = x;
        this.y = y;
        this.tileID = tileID;
    }
}

interface LevelLayer {
    tiles: LevelTile[],
    isInteractive: boolean,
    isHintLayer: boolean,
    opacity: number,
    visible: boolean,
}

export class Level {
    get width() { return this._width };
    get height() { return this._height };

    constructor(game: Game, map: TiledMap) {
        this._game = game;
        this._map = map;
    }

    private loadMap() {
        this._width = this._map.width;
        this._height = this._map.height;

        // Fill layers
        let tileLayers = this.extractTileLayers(this._map);
        this._layers = tileLayers.filter(layer => layer.data && layer.data.length > 0).map((layer, index) => {
            let gridLayer: LevelLayer = {
                tiles: [],
                isInteractive: this.isLayerInteractive(layer),
                isHintLayer: this.isHintLayer(layer),
                opacity: 1.0,
                visible: true,
            };
            let x = 0, y = 0;
            layer.data!.forEach((tileID, index) => {
                if (tileID > 0) {
                    x = index % this._width;
                    y = Math.floor(index / this._width);
                    gridLayer.tiles[x + y * this.width] = new LevelTile(x, y, tileID.toString());
                }
            })
            if (gridLayer.isInteractive)
                this._interactiveLayerIndex = index;
            return gridLayer;
        })
    }

    public start() {
        this.loadMap();
        this.setHintLayersOpacity(0.5);
        // TODO Store interactive layer initial state
        // TODO Randomize interactive layer
    }

    public isComplete() {
        // TODO Return true when all interactive tiles are back in their original positions
        return false;
    }

    public tryFlipTile(x: number, y: number) {
        const tile = this.getInteractiveTile(x, y);
        if (tile) {
            this.setInteractiveTileID(x, y, (parseInt(tile.tileID) - 39) % 4 + 40);
        }
    }

    public render() {
        this.renderLayers();
        this.renderGrid();
    }

    public getInteractiveTile(x: number, y: number) {
        return this._layers[this._interactiveLayerIndex].tiles[x + y * this.width];
    }

    public setInteractiveTileID(x: number, y: number, tileID: number) {
        const tile = this.getInteractiveTile(x, y);
        if (tile)
            tile.tileID = tileID.toString();
    }

    /** Use depth first search so returned layers should ordered properly */
    private extractTileLayers(map: TiledMap): TiledLayer[] {
        let layers: TiledLayer[] = [];
        const getTileLayers = (layer: TiledLayer) => {
            if (layer.type === 'tilelayer' && this.isLayerRenderable(layer))
                layers.push(layer);
            else if (layer.type === 'group')
                layer.layers?.forEach(child => getTileLayers(child));
        };
        map.layers.forEach(child => getTileLayers(child));
        return layers;
    }

    public setHintLayersOpacity(opacity: number) {
        this._layers.filter(layer => layer.isHintLayer).forEach(layer => layer.opacity = opacity);
    }

    public getInteractiveLayer() {
        return this._layers.find(layer => layer.isInteractive);
    }

    private isHintLayer(layer: TiledLayer): boolean {
        let isHint = false;
        if (layer.properties && layer.properties.length > 0)
            isHint = layer.properties.some(property => property.name === "hintLayer" && property.type === "bool" && property.value === true);
        return isHint;
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
            this._layers.forEach(layer => {
                this._game.renderer.ctx.globalAlpha = layer.opacity;
                layer.tiles.filter(tile => this.isTileValid(tile)).forEach(tile =>
                    this._game.renderer.ctx.drawImage(
                        this._game.assets.get(AssetType.IMAGE, tile.tileID),
                        tile.x * this._game.renderer.tileSize,
                        tile.y * this._game.renderer.tileSize,
                        this._game.renderer.tileSize, this._game.renderer.tileSize
                    )
                );
            })
        }
    }

    private isTileValid(tile: LevelTile) {
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

    private _layers: LevelLayer[] = [];
    private _interactiveLayerIndex: number = -1;
    private _width: number = 0;
    private _height: number = 0;
    private _game: Game;
    private _map: TiledMap;
}
