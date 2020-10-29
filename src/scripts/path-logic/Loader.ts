import { Tile, TiledJSONParser, TiledMap } from "../utils/TiledJSONParser";

export class Loader {
    public static async loadMaps(pathToMaps: string[]): Promise<TiledMap[]> {
        let maps: TiledMap[] = [];

        if (pathToMaps.length > 0) {
            try { maps = await TiledJSONParser.parseMaps(...pathToMaps); }
            catch (error) { throw new Error(`Error while parsing maps ${error.message}`) }
        } else {
            throw new Error("No map to load");
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

    public static async loadImage(path: string): Promise<HTMLImageElement> {
        const image = new Promise<HTMLImageElement>((resolve, reject) => {
            let image = new Image();
            image.onload = () => resolve(image);
            image.onerror = () => reject(`Could not load image at path ${path}`);
            image.src = path;
        });

        try { return image; }
        catch (error) { throw new Error(error); }
    }
}
