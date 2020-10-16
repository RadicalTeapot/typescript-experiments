import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithKeyboardHandler } from "../utils/WithKeyboardHandler";
import { AssetLoader, AssetItem } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";
import { Renderer } from "./Renderer";
import { World } from "./World";

class Base implements GameBaseClass {
    update() {}
    render() {}
}
const BaseConstructor = WithFixedStepUpdate(WithKeyboardHandler(Base));

export class Game extends BaseConstructor {
    get world() {return this._world};
    get renderer() {return this._renderer};
    get assets() {return this._assetLoader};

    constructor(canvas: HTMLCanvasElement) {
        super();
        this._assetLoader = new AssetLoader();
        this._renderer = new Renderer(this, canvas);
        this._world = new World(this);
    }

    public setItemsToLoad(...items: AssetItem[]) {
        this._assetLoader.setItemsToLoad(...items);
    }

    public setWorld(...map: string[]) {
        this._world.setMap(...map);
    }

    public update() {
        if (this.keys.up)
            console.log("Up pressed");
    }

    public render() {
        this._renderer.render();
    }

    public run() {
        this._assetLoader
            .load(() => { console.log("All assets loaded") })
            .then(result => super.run())
            .catch(error => console.log(`Error while loading assets: ${error}`));
    }

    private _assetLoader: AssetLoader;
    private _renderer: Renderer;
    private _world: World;
}
