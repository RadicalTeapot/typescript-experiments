import { Game } from "./Game";

class Tile {
    x: number = 0;
    y: number = 0;
    spriteID: string = "";
}

export class Grid {
    get width() {return 5};
    get height() {return 5};

    constructor(game: Game) {
        this._tiles = [];
        this._game = game;
    }

    public render() {}

    private _tiles: Tile[];
    private _game: Game;
}
