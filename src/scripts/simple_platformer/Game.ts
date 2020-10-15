import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithKeyboardHandler } from "../utils/WithKeyboardHandler";
import { AssetLoader, AssetItem } from "../utils/AssetLoader";
import { GameBaseClass } from "../utils/Constructors";

class Base implements GameBaseClass {
    update() {}
    render() {}
}
const BaseConstructor = WithFixedStepUpdate(WithKeyboardHandler(Base));

export class Game extends BaseConstructor {
    constructor() {
        super();
        this._assetLoader = new AssetLoader();
    }

    public setItemsToLoad(...items: AssetItem[]) {
        this._assetLoader.setItemsToLoad(...items);
    }

    public update() {
        if (this.keys.up)
            console.log("Up pressed");
    }

    public render() {

    }

    public run() {
        this._assetLoader
            .load(() => { console.log("All assets loaded") })
            .then(result => super.run())
            .catch(error => console.log(`Error while loading assets: ${error}`));
    }

    private _assetLoader: AssetLoader;
}
