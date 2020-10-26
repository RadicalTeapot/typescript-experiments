import { loadJSON } from "./AssetLoader";

export interface TiledMap {
    tilesets: MapTileset[],
    layers: TiledLayer[],
    width: number,
    height: number,
}

interface MapTileset {
    firstgid: number,
    source: string,
}

export interface TiledLayer {
    data?: number[]
    type: string
    name: string,
    layers?: TiledLayer[]
    objects?: TiledObject[],
    visible: boolean,
    properties?: TiledLayerProperty[]
}

export interface TiledLayerProperty {
    name: string,
    type: string,
    value: boolean | string | number
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
    public static async parseMaps(...paths: string[]): Promise<TiledMap[]> {
        const mapLoader = Promise.all(paths.map(path => loadJSON(path) as Promise<TiledMap>));

        let maps: TiledMap[] = [];
        try { maps = await mapLoader; }
        catch (error) { throw new Error(`Error while loading maps ${error.message}`); }

        return maps;
    }

    public static async parseTileSets(map: TiledMap, tilesetFolder: string, imagesRootFolder: string): Promise<Tile[]> {
        let result: Tile[][] = [];
        try { result = await TiledJSONParser.loadTiles(TiledJSONParser.getMapTilesets(map, tilesetFolder), imagesRootFolder); }
        catch (error) { throw new Error(error.message); }

        const tiles = result.reduce((current, accumulator) => {
            accumulator.push(...current);
            return accumulator;
        }, []);

        return tiles;
    }

    private static async loadTiles(tilesets: MapTileset[], imagesRootFolder: string): Promise<Tile[][]> {
        const tileLoader = Promise.all(tilesets.map(async ({source, firstgid}) => {
            const tileset: Tileset = await loadJSON(source);
            tileset.tiles.forEach(tile => {
                // Increase local tile id by tileset offset
                tile.id += firstgid;
                // Fix path
                tile.image = `${imagesRootFolder}/${tile.image.split('/').slice(-2).join("/")}`;
            });
            return tileset.tiles;
        }));

        let tiles: Tile[][] = [];
        try { tiles = await tileLoader; }
        catch (error) { throw new Error(`Error while loading tiles ${error.message}`) }
        return tiles;
    }

    private static getMapTilesets(map: TiledMap, tilesetFolder: string): MapTileset[] {
        return map.tilesets.map(tileset =>
            ({...tileset,
                // Fix path to tileset json file
                source:`${tilesetFolder}/${TiledJSONParser.extractFileName(tileset.source)}.json`
            })
        );
    }

    public static areTilesetsOrderIdentical(maps: TiledMap[]): boolean {
        if (maps.length < 2)
            return true;

        let order: Map<string, number> = new Map();
        maps[0].tilesets.forEach(tileset => order.set(tileset.source, tileset.firstgid));
        return maps.slice(1).some(map =>
            map.tilesets.some(tileset => !order.has(tileset.source) || order.get(tileset.source) !== tileset.firstgid)
        )
    }

    private static extractFileName(path: string) {
        const [filename,] = path.split('/').slice(-1);
        return filename.split('.')[0];
    }
}
