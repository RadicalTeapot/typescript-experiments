import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

const canvas = document.getElementById("canvas");
if (!canvas)
    throw new Error("Could not find canvas");


const game = new Game(canvas as HTMLCanvasElement);
game.setItemsToLoad(
    ['barrier', 'assets/path-logic/barrier_red.png', AssetType.IMAGE],
    ['car', 'assets/path-logic/car_red_3.png', AssetType.IMAGE],
    ['landGrass', 'assets/path-logic/land_grass04.png', AssetType.IMAGE],
    ['landGrassAlt', 'assets/path-logic/land_grass11.png', AssetType.IMAGE],
    ['roadStraightVert', 'assets/path-logic/road_asphalt01.png', AssetType.IMAGE],
    ['roadStraightHoriz', 'assets/path-logic/road_asphalt02.png', AssetType.IMAGE],
    ['roadTurnRight', 'assets/path-logic/road_asphalt03.png', AssetType.IMAGE],
    ['roadTurnLeft', 'assets/path-logic/road_asphalt05.png', AssetType.IMAGE],
    ['roadStartVert', 'assets/path-logic/road_asphalt77.png', AssetType.IMAGE],
    ['roadStartHoriz', 'assets/path-logic/road_asphalt78.png', AssetType.IMAGE],
    ['rock1', 'assets/path-logic/rock1.png', AssetType.IMAGE],
    ['rock2', 'assets/path-logic/rock2.png', AssetType.IMAGE],
    ['rock3', 'assets/path-logic/rock3.png', AssetType.IMAGE],
    ['treeLarge', 'assets/path-logic/tree_large.png', AssetType.IMAGE],
    ['treeSmall', 'assets/path-logic/tree_small.png', AssetType.IMAGE],
);
game.run();
