import { loadJSON } from "./AssetLoader";

export interface TiledData {
    maps: TiledMap[]
    tiles: Tile[]
}

export interface TiledMap {
    tilesets: MapTileset[],
    layers: Layer[],
}

interface MapTileset {
    firstgid: number,
    source: string,
}

interface Layer {
    data?: number[]
    type: string
    name: string,
    layers?: Layer[]
    objects?: TiledObject[],
    visible: boolean,
}

interface TiledObject {
    gid: number,
    width: number,
    height: number,
    rotation: number,
    x: number,
    y: number,
}

interface Tileset {
    tiles: Tile[]
}

export interface Tile {
    id: number,
    image: string,
    imagewidth: number,
    imageheight: number
}

export class TiledJSONParser {
    public static async parseMaps(...paths: string[]): Promise<TiledData> {
        const mapLoader = Promise.all(paths.map(path => loadJSON(path) as Promise<TiledMap>));
        let maps: TiledMap[] = [];
        try {
            maps = await mapLoader;
        } catch (error) {
            throw new Error(`Error while loading maps ${error.message}`);
        }
        console.log("Maps loaded");

        if (maps.length > 1 && !TiledJSONParser.isTilesetsOrderIdentical(maps.map(map => map.tilesets)))
            throw new Error("Non matching tileset order");

        const tiles = await TiledJSONParser.parseTileSets(maps[0].tilesets);
        console.log("Tiles loaded");

        return {maps, tiles};
    }

    private static isTilesetsOrderIdentical(mapTilesets: MapTileset[][]): boolean {
        let order: Map<string, number> = new Map();
        mapTilesets[0].forEach(tileset => order.set(tileset.source, tileset.firstgid));
        return mapTilesets.slice(1).some(tilesets =>
            tilesets.some(tileset => !order.has(tileset.source) || order.get(tileset.source) !== tileset.firstgid)
        )
    }

    private static extractFileName(path: string) {
        const [filename,] = path.split('/').slice(-1);
        return filename.split('.')[0];
    }

    private static async loadTileset(name: string): Promise<Tileset> {
        const path = `assets/path-logic/data/tilesets/${name}.json`;
        return await loadJSON(path);
    }

    private static async parseTileSets(tilesets: MapTileset[]) {
        const filenames = tilesets.map(tileset => TiledJSONParser.extractFileName(tileset.source));
        const tileLoader = Promise.all(filenames.map(async (filename, index) => {
            const tileset = await this.loadTileset(filename);
            tileset.tiles.forEach(tile => {
                // Increase local tile id by tileset offset
                tile.id += tilesets[index].firstgid;
                // Fix path
                tile.image = `assets/path-logic/${tile.image.split('/').slice(-2).join("/")}`;
            });
            return tileset.tiles;
        }));
        try {
            const result = await tileLoader;
            const tiles = result.reduce((current, accumulator) => {
                accumulator.push(...current);
                return accumulator;
            }, []);
            return tiles;
        } catch (error) {
            throw new Error(`Error while loading tiles ${error.message}`)
        }
    }
}
