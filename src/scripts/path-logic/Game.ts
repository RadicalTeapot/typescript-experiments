import { AssetItem, AssetLoader, AssetType } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";
import { Tile, TiledJSONParser, TiledMap } from "../utils/TiledJSONParser";
import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithTouchHandler } from "../utils/WithTouchHandler";
import { Grid } from "./Grid";
import { Renderer } from "./Renderer";

class BaseClass implements GameBaseClass {
   update() {}
   render() {}
}

const BaseConstructor = WithTouchHandler(WithFixedStepUpdate(BaseClass));
export class Game extends BaseConstructor {
    get renderer() {return this._renderer};
    get assets() {return this._assetLoader};
    get grid() {return this._grid};

    constructor(canvas: HTMLCanvasElement) {
        super();
        this._assetLoader = new AssetLoader();
        this._renderer = new Renderer(this, canvas);
        this._grid = new Grid(this);
        this._lastChangeCounter = 0;
    }

    public update() {
        /*
        if (this.touchState.isTouching && this._lastChangeCounter === 0) {
            let [x, y] = this.touchState.lastPosition;
            x = Math.floor(x / this._renderer.tileSize);
            y = Math.floor(y / this._renderer.tileSize);
            const tile = this._grid.getTile(x, y);
            if (tile) {
                this._grid.setTileType(x, y, tile.spriteID === "" ? "roadTurnRight" : "");
            }
            this._lastChangeCounter = 20;
        }
        else if (this._lastChangeCounter > 0) {
            this._lastChangeCounter--;
        }
        */
    }

    public render() {
        this._renderer.render();
    }

    public run() {
        this.start()
            .then(result => super.run())
            .catch(reason => console.log(reason))
        ;
    }

    public loadMaps(...pathToMaps: string[]) {
        this._pathToMaps = pathToMaps;
    }

    private async start() {
        let maps: TiledMap[], tiles: Tile[];
        try {
            const result = await TiledJSONParser.parseMaps(...this._pathToMaps);
            maps = result.maps;
            tiles = result.tiles;
        } catch (error) {
            throw new Error(`Error while parsing maps ${error.message}`)
        }

        this._assetLoader.setItemsToLoad(
            ...tiles.map(tile => [tile.id.toString(), tile.image, AssetType.IMAGE] as AssetItem)
        );

        try {
            await this._assetLoader.load(() => { console.log("All assets loaded") });
        } catch (error) {
            throw new Error(`Error while loading assets ${error.message}`);
        }
    }

    private _assetLoader: AssetLoader;
    private _renderer: Renderer;
    private _grid: Grid;
    private _lastChangeCounter: number;
    private _pathToMaps: string[] = [];
}