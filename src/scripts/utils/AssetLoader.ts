// Note: Factory pattern used here is based on this implementation https://blog.fullstacktraining.com/factory-pattern-in-typescript/
// and also this one https://www.typescriptlang.org/docs/handbook/functions.html#overloads

export enum AssetType {
    IMAGE,
    DATA
}
export type AssetItem = [string, string, AssetType];

abstract class Asset<T> {
    path: string;
    assetType: AssetType;
    object: T;

    constructor(path: string, assetType: AssetType, object: T) {
        this.path = path;
        this.assetType = assetType;
        this.object = object;
    }

    abstract async load(progressCallback?: (message: string) => void): Promise<void>
}

class ImageAsset extends Asset<HTMLImageElement> {
    constructor(path: string) {
        super(path, AssetType.IMAGE, new Image());
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
        } catch (error) {
            throw new Error(error);
        }
    }
}

class DataAsset extends Asset<string> {
    constructor(path: string) {
        super(path, AssetType.DATA, "");
    }
    public async load(progressCallback?: (message: string) => void) {
        progressCallback?.("");
    }
}

type AssetTypes = ImageAsset | DataAsset;
function AssetFactory(type: AssetType.IMAGE, path: string): ImageAsset;
function AssetFactory(type: AssetType.DATA, path: string): DataAsset;
function AssetFactory(type: AssetType, path: string): AssetTypes;
function AssetFactory(type: AssetType, path: string) {
    switch (type) {
        case AssetType.IMAGE:
            return new ImageAsset(path);
        case AssetType.DATA:
            return new DataAsset(path);
    }
}

export class AssetLoader {

    constructor() {
        this._assets = new Map();
    }

    public setItemsToLoad(...items: AssetItem[]) {
        this._assets = new Map();
        items.forEach(([id, path, assetType]) => this._assets.set(id, AssetFactory(assetType, path)));
    }

    public async load(doneLoadingCallback?: () => void) {
        let promises: Promise<void>[] = [];
        let index = 0;
        for (let [id, asset] of this._assets) {
            index++;
            promises.push(asset.load(this.updateProgress.bind(this, index)));
        }

        try {
            await Promise.all(promises);
            doneLoadingCallback?.();
        } catch (error) {
            throw new Error(error.message);
        }
    }

    public get(id: string) {
        if (this._assets.has(id))
            return this._assets.get(id)!.object;
        return null;
    }

    private updateProgress(index: number, message: string) {
        console.log(`${Math.floor(100 * index / this._assets.size)} % loaded (${message})`);
    }

    private _assets: Map<string, AssetTypes>;
}
