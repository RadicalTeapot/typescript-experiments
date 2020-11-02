import { AssetItem, AssetLoader, AssetType } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";
import { Tile, TiledJSONParser, TiledMap } from "../utils/TiledJSONParser";
import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithTouchHandler } from "../utils/WithTouchHandler";
import { ErrorState, GameState, LoadedLevelState, StartScreenState } from "./GameState";
import { LevelManager } from "./LevelManager";
import { Loader } from "./Loader";
import { Renderer } from "./Renderer";

class BaseClass implements GameBaseClass {
   update() {}
   render() {}
}

const BaseConstructor = WithTouchHandler(WithFixedStepUpdate(BaseClass));
export class Game extends BaseConstructor {
    get renderer() { return this._renderer }
    get assets() { return this._assetLoader }
    get levelManager() { return this._levelManager }
    get state() { return this._state }

    constructor(canvas: HTMLCanvasElement) {
        super();
        this._assetLoader = new AssetLoader();
        this._renderer = new Renderer(this, canvas);
        this._levelManager = new LevelManager(this);
        this._lastTouchCounter = 0;
        this._state = new GameState(this);
    }

    public update() {
        if (this.touchState.isTouching && this._lastTouchCounter === 0) {
            this._state.touched(...this.touchState.lastPosition);
            this._lastTouchCounter = 20;
        }
        else if (this._lastTouchCounter > 0) {
            this._lastTouchCounter--;
        }
    }

    /** Load splash screen and start the game */
    public run(...pathToMaps: string[]) {
        Loader.loadFont('pixelSquare', 'assets/path-logic/Kenney Pixel Square.ttf')
        .then(result => {
            super.run();
            this._state.transitionTo(StartScreenState, {pathToMaps: pathToMaps});
        }).catch((reason: Error) => {
            this._state.transitionTo(ErrorState, {error: reason});
        })
    }

    public render() {
        this._renderer.render();
    }

    private _assetLoader: AssetLoader;
    private _renderer: Renderer;
    private _levelManager: LevelManager;
    private _lastTouchCounter: number;
    private _state: GameState;
    private readonly _pathToLoadingScreenImage: string = 'assets/path-logic/loading_page.png';
}
