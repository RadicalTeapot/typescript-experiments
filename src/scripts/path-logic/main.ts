import { Game } from "./Game";

const canvas = document.getElementById("canvas");
if (!canvas)
    throw new Error("Could not find canvas");


const game = new Game(canvas as HTMLCanvasElement, 'assets/path-logic/data/maps/map1.json');
game.run();
