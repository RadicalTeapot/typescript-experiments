// Note: Factory pattern used here is based on this implementation https://blog.fullstacktraining.com/factory-pattern-in-typescript/
// and also this one https://www.typescriptlang.org/docs/handbook/functions.html#overloads

export enum AssetType {
    IMAGE,
    JSON
}
export type AssetItem = [string, string, AssetType];

abstract class Asset<T> {
    id: string;
    path: string;
    assetType: AssetType;
    object: T;

    constructor(id: string, path: string, assetType: AssetType, object: T) {
        this.id = id;
        this.path = path;
        this.assetType = assetType;
        this.object = object;
    }

    abstract async load(progressCallback?: (message: string) => void): Promise<Asset<T>>
}

class ImageAsset extends Asset<HTMLImageElement> {
    constructor(id: string, path: string) {
        super(id, path, AssetType.IMAGE, new Image());
    }

    public async load(progressCallback?: (message: string) => void) {
        const imageLoader = new Promise<string>((resolve, reject) => {
            this.object.onload = () => resolve(this.path);
            this.object.onerror = () => reject(`Could not load image at ${this.path}`);
            this.object.src = this.path;
        });
        try {
            const result = await imageLoader;
            progressCallback?.(result);
            return this;
        } catch (error) {
            throw new Error(error);
        }
    }
}

class JsonAsset extends Asset<any> {
    constructor(id: string, path: string) {
        super(id, path, AssetType.JSON, null);
    }
    public async load(progressCallback?: (message: string) => void) {
        const jsonLoader = new Promise<string>((resolve, reject) => {
            let xObj = new XMLHttpRequest();
            xObj.overrideMimeType('application/json');
            xObj.open('GET', this.path, true);
            xObj.onreadystatechange = () => {
                if (xObj.readyState === 4 && xObj.status === 200)
                    {
                        this.object = JSON.parse(xObj.responseText);
                        resolve(this.path);
                    }
            }
            xObj.onerror = () => reject(`Could not load JSON file at ${this.path}`);
            xObj.send(null);
        });

        try {
            const result = await jsonLoader;
            progressCallback?.(result);
            return this;
        } catch (error) {
            throw new Error(error);
        }
    }
}

type AssetTypes = ImageAsset | JsonAsset;
function AssetFactory(id: string, type: AssetType.IMAGE, path: string): ImageAsset;
function AssetFactory(id: string, type: AssetType.JSON, path: string): JsonAsset;
function AssetFactory(id: string, type: AssetType, path: string): AssetTypes;
function AssetFactory(id: string, type: AssetType, path: string) {
    switch (type) {
        case AssetType.IMAGE:
            return new ImageAsset(id, path);
        case AssetType.JSON:
            return new JsonAsset(id, path);
    }
}

export class AssetLoader {

    constructor() {
        this._assets = new Map();
        this._loadPromises = [];
        this._loadedCounter = 0;
        this.updateProgress = this.updateProgress.bind(this);
    }

    public setItemsToLoad(...items: AssetItem[]) {
        this._loadPromises = [];
        items.forEach(
            ([id, path, assetType], index) =>
            this._loadPromises.push(AssetFactory(id, assetType, path).load(this.updateProgress))
        );
    }

    public async load(doneLoadingCallback?: () => void) {
        try {
            this._loadedCounter = 0;
            const results = await Promise.all(this._loadPromises);
            this._assets = new Map();
            results.forEach(asset => this._assets.set(asset.id, asset));
            doneLoadingCallback?.();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public get(type: AssetType.IMAGE, id: string): HTMLImageElement;
    public get(type: AssetType.JSON, id: string): any;
    public get(type: AssetType, id: string): HTMLImageElement | any;
    public get(type: AssetType, id: string) {
        if (!(this._assets.has(id) && this._assets.get(id)?.assetType === type))
            throw new Error(`Couldn't find asset with ID ${id} and type ${type}`);
        return this._assets.get(id)!.object;
    }

    public has(type: AssetType, id: string)
    {
        return this._assets.has(id) && this._assets.get(id)?.assetType === type;
    }

    private updateProgress(message: string) {
        console.log(`${Math.floor(100 * ++this._loadedCounter / this._loadPromises.length)} % loaded (${message})`);
    }

    private _loadPromises: Promise<AssetTypes>[];
    private _assets: Map<string, AssetTypes>;
    private _loadedCounter: number;
}
