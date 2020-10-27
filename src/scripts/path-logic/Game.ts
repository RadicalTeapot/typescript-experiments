import { AssetItem, AssetLoader, AssetType } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";
import { Tile, TiledJSONParser, TiledMap } from "../utils/TiledJSONParser";
import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithTouchHandler } from "../utils/WithTouchHandler";
import { LevelManager } from "./LevelManager";
import { Renderer } from "./Renderer";

class BaseClass implements GameBaseClass {
   update() {}
   render() {}
}

const BaseConstructor = WithTouchHandler(WithFixedStepUpdate(BaseClass));
export class Game extends BaseConstructor {
    get renderer() { return this._renderer }
    get assets() { return this._assetLoader }
    get currentLevel() { return this._levelManager.currentLevel }

    constructor(canvas: HTMLCanvasElement, ...pathToMaps: string[]) {
        super();
        this._assetLoader = new AssetLoader();
        this._renderer = new Renderer(this, canvas);
        this._levelManager = new LevelManager(this);
        this._lastChangeCounter = 0;
        this._pathToMaps = pathToMaps;
    }

    public update() {
        if (this.touchState.isTouching && this._lastChangeCounter === 0) {
            let [x, y] = this.touchState.lastPosition;
            const canvasRect = this._renderer.canvas.getBoundingClientRect();
            x = Math.floor((x - canvasRect.left) / (this._renderer.tileSize * this._renderer.scale));
            y = Math.floor((y - canvasRect.top) / (this._renderer.tileSize * this._renderer.scale));
            this._levelManager.currentLevel.tryFlipTile(x, y);
            this._lastChangeCounter = 20;
        }
        else if (this._lastChangeCounter > 0) {
            this._lastChangeCounter--;
        }
    }

    public render() {
        this._renderer.render();
    }

    public run() {
        if (this._pathToMaps.length > 0) {
            Loader.loadMaps(this._pathToMaps)
                .then(result => {
                    this._levelManager.setMaps(result);
                    if (result.length > 0)
                        return Loader.loadTiles(result[0]);
                    else
                        return Promise.reject("No maps loaded");
                })
                .then(result => {
                    this._assetLoader.setItemsToLoad(
                        ...result.map(tile => [tile.id.toString(), tile.image, AssetType.IMAGE] as AssetItem)
                    );
                    return this._assetLoader.load(() => console.log("All assets loaded"));
                })
                .then(() => {
                    this._levelManager.startLevel(0);
                    super.run();
                })
                .catch(reason => console.log(reason));
        }
    }

    private _assetLoader: AssetLoader;
    private _renderer: Renderer;
    private _levelManager: LevelManager;
    private _lastChangeCounter: number;
    private _pathToMaps: string[];
}

class Loader {
    public static async loadMaps(pathToMaps: string[]): Promise<TiledMap[]> {
        let maps: TiledMap[] = [];

        if (pathToMaps.length > 0)
        {
            try { maps = await TiledJSONParser.parseMaps(...pathToMaps); }
            catch (error) { throw new Error(`Error while parsing maps ${error.message}`) }
        }

        if (!TiledJSONParser.areTilesetsOrderIdentical(maps))
            throw new Error("Non matching tileset order");

        return maps;
    }

    public static async loadTiles(map: TiledMap): Promise<Tile[]> {
        let tiles: Tile[] = [];

        try { tiles = await TiledJSONParser.parseTileSets(map, 'assets/path-logic/data/tilesets', 'assets/path-logic'); }
        catch (error) { throw new Error(`Error while parsing tilesets ${error.message}`) }

        return tiles;
    }
}
