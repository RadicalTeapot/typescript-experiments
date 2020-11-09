import { AssetType } from "../utils/AssetLoader";
import { TiledLayer, TiledMap } from "../utils/TiledJSONParser";
import { Game } from "./Game";

class LevelTile {
    x: number;
    y: number;
    tileID: string;
    valid: boolean;

    constructor(x: number, y: number, tileID: string, valid: boolean) {
        this.x = x;
        this.y = y;
        this.tileID = tileID;
        this.valid = valid;
    }
}

class LevelObject extends LevelTile {
    rotation: number;
    width: number;
    height: number;

    constructor(x: number, y: number, rotation: number, width: number, height: number, tileID: string, valid: boolean) {
        super(x, y, tileID, valid);
        this.rotation = rotation;
        this.width = width;
        this.height = height;
    }
}

class ObjectLayer {
    get isRenderable() { return this._isRenderable };

    private constructor(game: Game) {
        this._game = game;
    }

    static FromTiledLayer(tiledLayer: TiledLayer, game: Game) {
        let self = new ObjectLayer(game);
        self._objects = [];
        self._isRenderable = ObjectLayer.IsLayerRenderable(tiledLayer);
        let tileID = '';
        tiledLayer.objects?.filter(tiledObject => tiledObject.gid !== undefined).forEach(tiledObject => {
            tileID = tiledObject.gid.toString();
            self._objects.push(
                new LevelObject(
                    tiledObject.x, tiledObject.y,
                    tiledObject.rotation * Math.PI / 180,
                    tiledObject.width, tiledObject.height, tileID,
                    ObjectLayer.IsTileValid(tileID, game)
                )
            );
        });
        return self;
    }

    private static IsLayerRenderable(layer: TiledLayer): boolean {
        let renderable = false;
        if (layer.properties && layer.properties.length > 0)
            renderable = layer.properties.some(property => property.name === "renderable" && property.type === "bool" && property.value === true);
        return renderable;
    }

    public render() {
        const ctx = this._game.renderer.ctx;
        this._objects.filter(obj => obj.valid).forEach(obj => {
            ctx.save();
            ctx.translate(obj.x, obj.y);
            ctx.rotate(obj.rotation);
            ctx.drawImage(this._game.assets.get(AssetType.IMAGE, obj.tileID), 0, -obj.height);
            ctx.restore();
        });
    }

    private static IsTileValid(tileID: string, game: Game) {
        return game.assets.has(AssetType.IMAGE, tileID);
    }

    private _objects: LevelObject[] = [];
    private _isRenderable: boolean = false;
    private _game: Game;
}

class LevelLayer {
    opacity: number
    visible: boolean
    get tiles() { return this._tiles };
    get isInteractive() { return this._isInteractive };
    get isRenderable() { return this._isRenderable };
    get isHint() { return this._isHint };

    private constructor(game: Game) {
        this.opacity = 1.0;
        this.visible = true;
        this._game = game;
    }

    public render() {
        if (this._isRenderable) {
            this._game.renderer.ctx.globalAlpha = this.opacity;
            this._tiles.filter(tile => tile.valid).forEach(tile =>
                this._game.renderer.ctx.drawImage(
                    this._game.assets.get(AssetType.IMAGE, tile.tileID),
                    tile.x * this._game.renderer.tileSize,
                    tile.y * this._game.renderer.tileSize,
                    this._game.renderer.tileSize, this._game.renderer.tileSize
                )
            );
        }
    }

    static Clone(levelLayer: LevelLayer) {
        let layer = new LevelLayer(levelLayer._game);
        layer._tiles = levelLayer._tiles.map(tile => new LevelTile(tile.x, tile.y, tile.tileID, tile.valid));
        layer._isInteractive = levelLayer._isInteractive;
        layer._isRenderable = levelLayer._isRenderable;
        layer._isHint = levelLayer._isHint;
        return layer;
    }

    static FromTiledLayer(tiledLayer: TiledLayer, mapWidth: number, game: Game) {
        let layer = new LevelLayer(game);
        layer._tiles = layer.extractLayerTiles(tiledLayer.data, mapWidth);
        layer._isInteractive = layer.isLayerInteractive(tiledLayer);
        layer._isRenderable = layer.isLayerRenderable(tiledLayer);
        layer._isHint = layer.isHintLayer(tiledLayer);
        return layer;
    }

    public isIdentical(layer: LevelLayer) {
        return !this._tiles.some((tile, index) => !layer.tiles[index] || layer.tiles[index].tileID !== tile.tileID);
    }

    private isTileValid(tileID: string) {
        return this._game.assets.has(AssetType.IMAGE, tileID);
    }

    private extractLayerTiles(layerData: number[] | undefined, mapWidth: number): LevelTile[] {
        let tiles: LevelTile[] = [];
        if (layerData && layerData.length > 0) {
            let x = 0, y = 0;
            layerData!.forEach((tileID, index) => {
                if (tileID > 0) {
                    x = index % mapWidth;
                    y = Math.floor(index / mapWidth);
                    tiles[x + y * mapWidth] = new LevelTile(x, y, tileID.toString(), this.isTileValid(tileID.toString()));
                }
            })
        }
        return tiles;
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

    private _tiles: LevelTile[] = [];
    private _isInteractive: boolean = false;
    private _isHint: boolean = false;
    private _isRenderable: boolean = false;
    private _game: Game
}

export class Level {
    get width() { return this._width };
    get height() { return this._height };

    constructor(game: Game, map: TiledMap) {
        this._game = game;
        this._map = map;
    }

    public start() {
        this.loadMap();
        this.setHintLayersOpacity(0.5);
        if (this._interactiveLayerIndex > -1) {
            this._originalInteractiveLayer = LevelLayer.Clone(this._layers[this._interactiveLayerIndex]);
            // Randomize layer
            this._layers[this._interactiveLayerIndex].tiles.forEach(tile => tile.tileID = (Math.floor(Math.random() * 4) + 40).toString());
        }
    }

    public isComplete() {
        return this._originalInteractiveLayer ? this._layers[this._interactiveLayerIndex].isIdentical(this._originalInteractiveLayer) : false;
    }

    public tryFlipTile(x: number, y: number) {
        const tile = this.getInteractiveTile(x, y);
        if (tile) {
            this.setInteractiveTileID(x, y, (parseInt(tile.tileID) - 39) % 4 + 40);
        }
    }

    public render() {
        this._layers.forEach(layer => layer.render());
        //this.renderGrid();
        this._objectLayers.forEach(layer => layer.render());
    }

    public getInteractiveTile(x: number, y: number) {
        return this._layers[this._interactiveLayerIndex].tiles[x + y * this.width];
    }

    public setInteractiveTileID(x: number, y: number, tileID: number) {
        const tile = this.getInteractiveTile(x, y);
        // TODO check if tile is still valid?
        if (tile)
            tile.tileID = tileID.toString();
    }

    private loadMap() {
        this._width = this._map.width;
        this._height = this._map.height;
        this.extractTileLayers();
        this._interactiveLayerIndex = this._layers.findIndex(layer => layer.isInteractive);
    }

    /** Use depth first search so returned layers should ordered properly */
    private extractTileLayers() {
        this._layers = [];
        const getTileLayers = (layer: TiledLayer) => {
            if (layer.type === 'tilelayer')
                this._layers.push(LevelLayer.FromTiledLayer(layer, this._map.width, this._game));
            else if (layer.type === 'group')
                layer.layers?.forEach(child => getTileLayers(child));
            else if (layer.type === 'objectgroup' && layer.objects && layer.objects.length > 0)
                this._objectLayers.push(ObjectLayer.FromTiledLayer(layer, this._game));
        };
        this._map.layers.forEach(child => getTileLayers(child));
    }

    public setHintLayersOpacity(opacity: number) {
        this._layers.filter(layer => layer.isHint).forEach(layer => layer.opacity = opacity);
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
    private _objectLayers: ObjectLayer[] = [];
    private _originalInteractiveLayer?: LevelLayer;
    private _interactiveLayerIndex: number = -1;
    private _width: number = 0;
    private _height: number = 0;
    private _game: Game;
    private _map: TiledMap;
}
