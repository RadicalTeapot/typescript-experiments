import { Tile, TiledJSONParser, TiledMap } from "../utils/TiledJSONParser";

export class Loader {
    public static async loadMaps(pathToMaps: string[]): Promise<TiledMap[]> {
        let maps: TiledMap[] = [];

        if (pathToMaps.length > 0)
        {
            try { maps = await TiledJSONParser.parseMaps(...pathToMaps); }
            catch (error) { throw new Error(`Error while parsing maps ${error.message}`) }
        }

        if (!TiledJSONParser.areTilesetsOrderIdentical(maps))
            throw new Error("Non matching tileset order");

        return maps;
    }

    public static async loadTiles(map: TiledMap): Promise<Tile[]> {
        let tiles: Tile[] = [];

        try { tiles = await TiledJSONParser.parseTileSets(map, 'assets/path-logic/data/tilesets', 'assets/path-logic'); }
        catch (error) { throw new Error(`Error while parsing tilesets ${error.message}`) }

        return tiles;
    }
}
