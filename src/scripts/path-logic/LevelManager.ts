import { TiledMap } from "../utils/TiledJSONParser";
import { Game } from "./Game";
import { Level } from "./Level";

export class LevelManager {
    get currentLevel() { return this._levels[this._currentLevelIndex] }

    constructor(game: Game) {
        this._game = game;
    }

    public setMaps(maps: TiledMap[]) {
        this._levels = maps.map(map => new Level(this._game, map));
    }

    public startLevel(levelIndex: number): Level | undefined {
        if (levelIndex < this._levels.length)
        {
            this._currentLevelIndex = levelIndex;
            this._levels[levelIndex].start();
        }
        return this._levels[levelIndex];
    }

    private _game: Game;
    private _levels: Level[] = [];
    private _currentLevelIndex = 0;
}
