// Note: Factory pattern used here is based on this implementation https://blog.fullstacktraining.com/factory-pattern-in-typescript/
// and also this one https://www.typescriptlang.org/docs/handbook/functions.html#overloads

export enum AssetType {
    IMAGE,
    DATA
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

class DataAsset extends Asset<string> {
    constructor(id: string, path: string) {
        super(id, path, AssetType.DATA, "");
    }
    public async load(progressCallback?: (message: string) => void) {
        progressCallback?.("");
        return this;
    }
}

type AssetTypes = ImageAsset | DataAsset;
function AssetFactory(id: string, type: AssetType.IMAGE, path: string): ImageAsset;
function AssetFactory(id: string, type: AssetType.DATA, path: string): DataAsset;
function AssetFactory(id: string, type: AssetType, path: string): AssetTypes;
function AssetFactory(id: string, type: AssetType, path: string) {
    switch (type) {
        case AssetType.IMAGE:
            return new ImageAsset(id, path);
        case AssetType.DATA:
            return new DataAsset(id, path);
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
    public get(type: AssetType.DATA, id: string): string;
    public get(type: AssetType, id: string): HTMLImageElement | string;
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