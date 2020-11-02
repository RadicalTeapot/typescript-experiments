import { AssetItem, AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";
import { Level } from "./Level";
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


interface StartScreenParams {pathToMaps: string[]}
export class StartScreenState extends State<StartScreenParams> {
    public enter() {
        this.loadData();
    }

    private loadData() {
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
                    ['level_select', 'assets/path-logic/level_select.png', AssetType.IMAGE],
                    ...result.map(tile => [tile.id.toString(), tile.image, AssetType.IMAGE] as AssetItem)
                );
                return this._context.game.assets.load(() => console.log("All assets loaded"));
            })
            .then(() => {
                // Disabled for testing purposes
                // this._context.transitionTo(LevelSelectorState, {});
            })
            .catch((reason: Error) => {
                this._context.transitionTo(ErrorState, { error: reason })
            });
    }

    // For testing purposes
    public touched(x: number, y: number) {
        this._context.transitionTo(LevelSelectorState, {});
    }

    public render() {
        const renderer = this._context.game.renderer;
        renderer.ctx.save();
        renderer.ctx.fillStyle = "#222034";
        renderer.ctx.fillRect(0, 0, renderer.width, renderer.height);
        renderer.ctx.fillStyle = "#FFF";
        renderer.ctx.font = '160px pixelSquare';
        renderer.ctx.fillText("Road builder", 100, 300);
        renderer.ctx.font = '72px pixelSquare';
        renderer.ctx.fillText("Loading...", 100, 500);
        renderer.ctx.restore();
    }
}

interface ErrorParams {error: Error}
export class ErrorState extends State<ErrorParams> {
    public enter() {
        console.log(`An error occurred\n${this._params.error.message}`);
    }

    public render() {
        this._context.game.renderer.ctx.save();
        this._context.game.renderer.ctx.fillStyle = "red";
        this._context.game.renderer.ctx.fillText(this._params.error.message, 0, 0);
        this._context.game.renderer.ctx.restore();
    }
}

export class LevelSelectorState extends State<{}> {
    // For testing purposes
    public touched(x: number, y: number) {
        this._context.transitionTo(LoadedLevelState, { levelIndex: 0 });
    }

    public render() {
        this._context.game.renderer.ctx.save();
        this._context.game.renderer.ctx.translate(
            (innerWidth - this._context.game.assets.get(AssetType.IMAGE, 'level_select').width) / 2,
            (innerHeight - this._context.game.assets.get(AssetType.IMAGE, 'level_select').height) / 2,
        );
        this._context.game.renderer.ctx.drawImage(this._context.game.assets.get(AssetType.IMAGE, 'level_select'), 0, 0);
        this._context.game.renderer.ctx.restore();
    }
}

interface LoadedLevelParams {levelIndex: number}
export class LoadedLevelState extends State<LoadedLevelParams> {
    public enter() {
        this._currentLevel = this._context.game.levelManager.startLevel(this._params.levelIndex);
        if (!this._currentLevel)
            this._context.transitionTo(ErrorState, {error: new Error(`Could not load level ${this._params.levelIndex}`)});
    }

    public touched(x: number, y: number) {
        x = Math.floor((x - this._translate[0]) / this._tileSize);
        y = Math.floor((y - this._translate[1]) / this._tileSize);
        this._currentLevel?.tryFlipTile(x, y);
        if (this._currentLevel?.isComplete()) {
            this._context.transitionTo(LevelWonState, {});
        }
    }

    public render() {
        const renderer = this._context.game.renderer;
        this.updateSize();
        renderer.ctx.save();
        renderer.ctx.translate(...this._translate);
        renderer.ctx.scale(this._scale, this._scale);
        this._currentLevel?.render();
        renderer.ctx.restore();
    }

    private updateSize() {
        const renderer = this._context.game.renderer;
        this._scale = this._currentLevel ? Math.min(renderer.width / (renderer.tileSize * this._currentLevel.width), renderer.height / (renderer.tileSize * this._currentLevel.height)) : 1;
        this._tileSize = renderer.tileSize * this._scale;
        this._translate = [0, 0];
        if (renderer.height < renderer.width)
            this._translate[0] = renderer.width * 0.5 - (this._currentLevel?.width ?? 0) * this._tileSize * 0.5;
        else
            this._translate[1] = renderer.height * 0.5 - (this._currentLevel?.height ?? 0) * this._tileSize * 0.5;
    }

    private _currentLevel?: Level;
    private _translate: [number, number] = [0, 0];
    private _scale: number = 1;
    private _tileSize: number = 1;
}

export class LevelWonState extends State<{}> {}
