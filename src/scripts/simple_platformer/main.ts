import { AssetLoader, AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

const loader = new AssetLoader([
    ['bgBackground', 'assets/simple_platformer/bg_background.png', AssetType.IMAGE],
    ['bgHills', 'assets/simple_platformer/bg_hills.png', AssetType.IMAGE],
]);

function allLoaded() {
    console.log("All assets loaded!");
}

const game = new Game();
game.update = function () {
    if (this.keys.up)
        console.log("Up key pressed");
}

loader.load(allLoaded)
    .then(result => game.run())
    .catch(error => console.log(`Error while loading assets ${error}`))
    ;
