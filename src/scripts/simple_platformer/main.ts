import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

const canvas = document.getElementById("canvas");
if (!canvas)
    throw new Error("Could not find canvas");


const game = new Game(canvas as HTMLCanvasElement);
game.setItemsToLoad(
    ['bgBackground', 'assets/simple_platformer/bg_background.png', AssetType.IMAGE],
    ['bgHills', 'assets/simple_platformer/bg_hills.png', AssetType.IMAGE],
    ['bgBackground', 'assets/simple_platformer/bg_background.png', AssetType.IMAGE],
    ['bgHills', 'assets/simple_platformer/bg_hills.png', AssetType.IMAGE],
    ['bgTiles', 'assets/simple_platformer/bg_tiles.png', AssetType.IMAGE],
    ['playerFall', 'assets/simple_platformer/player_fall.png', AssetType.IMAGE],
    ['playerJump1', 'assets/simple_platformer/player_jump1.png', AssetType.IMAGE],
    ['playerJump2', 'assets/simple_platformer/player_jump2.png', AssetType.IMAGE],
    ['playerStand', 'assets/simple_platformer/player_stand.png', AssetType.IMAGE],
    ['playerWalk1', 'assets/simple_platformer/player_walk1.png', AssetType.IMAGE],
    ['playerWalk2', 'assets/simple_platformer/player_walk2.png', AssetType.IMAGE],
    ['playerWalk3', 'assets/simple_platformer/player_walk3.png', AssetType.IMAGE],
    ['tileFull', 'assets/simple_platformer/tile_full.png', AssetType.IMAGE],
    ['tileTop', 'assets/simple_platformer/tile_top.png', AssetType.IMAGE],
    ['params', 'assets/simple_platformer/params.json', AssetType.JSON],
);
game.setWorld(
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '0000000000000000',
    '000000000000000x',
    'x0000000000000xx',
    'xx00xxxx000xxxxx',
);
game.run();
