import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithKeyboardHandler } from "../utils/WithKeyboardHandler";
import { AssetLoader, AssetItem, AssetType } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";
import { Renderer } from "./Renderer";
import { World } from "./World";
import { Player } from "./Player";

class Base implements GameBaseClass {
    update() {}
    render() {}
}
const BaseConstructor = WithFixedStepUpdate(WithKeyboardHandler(Base));

export class Game extends BaseConstructor {
    get world() {return this._world};
    get renderer() {return this._renderer};
    get assets() {return this._assetLoader};
    get player() {return this._player};

    constructor(canvas: HTMLCanvasElement) {
        super();
        this._assetLoader = new AssetLoader();
        this._renderer = new Renderer(this, canvas);
        this._world = new World(this);
        this._player = new Player(this, [5 * this._renderer.tileSize, 8 * this._renderer.tileSize]);
    }

    public setItemsToLoad(...items: AssetItem[]) {
        this._assetLoader.setItemsToLoad(...items);
    }

    public setWorld(...map: string[]) {
        this._world.setMap(...map);
    }

    public update() {
        this._player.update();
    }

    public render() {
        this._renderer.render();
    }

    public run() {
        this._assetLoader
            .load(() => { console.log("All assets loaded") })
            .then(result => {
                this.loadConfig();
                super.run();
            })
            .catch(error => console.log(`Error while loading assets: ${error}`));
    }

    public loadConfig() {
        const config = this._assetLoader.get(AssetType.JSON, "params");
        this._player.loadConfig(config.player);
        this._renderer.debug = config.debug;
    }

    private _assetLoader: AssetLoader;
    private _renderer: Renderer;
    private _world: World;
    private _player: Player;
}
