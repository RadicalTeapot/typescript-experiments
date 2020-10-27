import { AssetItem, AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";
import { Loader } from "./Loader";

type StateType = StartScreenState | LoadedLevelState | LevelWonState;
export class GameState {
    public get game() { return this._game }

    constructor(game: Game) {
        this._game = game;
    }

    public transitionTo<S>(ctor: new(context: GameState, params: S) => StateType, params: S) {
        this._state?.exit();
        this._state = new ctor(this, params);
        this._state.enter();
    }

    public render() {
        this._state?.render();
    }

    public touched(x: number, y: number) {
        this._state?.touched(x, y);
    }

    private _game: Game;
    private _state?: StateType;
}

abstract class State<T> {
    constructor(context: GameState, params: T) {
        this._params = params;
        this._context = context;
    }

    public enter() {};
    public exit() {};
    public touched(x: number, y: number) {};
    public render() {};

    protected _params: T;
    protected _context: GameState;
}


interface StartScreenParams {pathToMaps: string[], exitCallback: () => void}
export class StartScreenState extends State<StartScreenParams> {
    public enter() {
        if (this._params.pathToMaps.length > 0) {
            Loader.loadMaps(this._params.pathToMaps)
                .then(result => {
                    this._context.game.levelManager.setMaps(result);
                    if (result.length > 0)
                        return Loader.loadTiles(result[0]);
                    else
                        return Promise.reject("No maps loaded");
                })
                .then(result => {
                    this._context.game.assets.setItemsToLoad(
                        ...result.map(tile => [tile.id.toString(), tile.image, AssetType.IMAGE] as AssetItem)
                    );
                    return this._context.game.assets.load(() => console.log("All assets loaded"));
                })
                .then(() => {
                    this._context.transitionTo(LoadedLevelState, {levelIndex: 0});
                })
                .catch(reason => console.log(reason));
        }
    }

    public exit() {
        this._params.exitCallback();
    }
}

export class LevelSelectorState extends State<{}> {}

interface LoadedLevelParams {levelIndex: number}
export class LoadedLevelState extends State<LoadedLevelParams> {
    public enter() {
        this._context.game.levelManager.startLevel(this._params.levelIndex);
    }

    public touched(x: number, y: number) {
        x = Math.floor(x / (this._context.game.renderer.tileSize * this._context.game.renderer.scale));
        y = Math.floor(y / (this._context.game.renderer.tileSize * this._context.game.renderer.scale));
        this._context.game.levelManager.currentLevel.tryFlipTile(x, y);
        if (this._context.game.levelManager.currentLevel.isComplete()) {
            this._context.transitionTo(LevelWonState, {});
        }
    }

    public render() {
        this._context.game.levelManager.currentLevel.render();
    }
}

export class LevelWonState extends State<{}> {}
