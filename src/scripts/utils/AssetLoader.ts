export enum AssetType {
    IMAGE
}

type AssetTypes = HTMLImageElement;

class Asset<T extends AssetTypes> {
    path: string;
    assetType: AssetType;
    object: T;

    constructor(path: string, assetType: AssetType, object: T) {
        this.path = path;
        this.assetType = assetType;
        this.object = object;
    }

    public async load(progressCallback?: (message: string) => void) {
        switch (this.assetType) {
            case AssetType.IMAGE:
                const imageLoader = new Promise<string>((resolve, reject) => {
                    const o = (this.object as HTMLImageElement);
                    o.onload = () => resolve(this.path);
                    o.onerror = () => reject(`Could not load image at ${this.path}`);
                    o.src = this.path;
                });
                try {
                    const result = await imageLoader;
                    progressCallback?.(result);
                } catch (error) {
                    throw new Error(error);
                }
        }
    }
}

function AssetFactory(path: string, assetType: AssetType) {
    switch (assetType) {
        case AssetType.IMAGE:
            return new Asset(path, assetType, new Image());
    }
}

export class AssetLoader {

    constructor(paths: [string, string, AssetType][]) {
        this._assets = new Map();
        paths.forEach(([id, path, assetType]) => this._assets.set(id, AssetFactory(path, assetType)));
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

    public getAssetData(id: string) {
        if (this._assets.has(id))
            return this._assets.get(id)!.object;
        return null;
    }

    private updateProgress(index: number, message: string) {
        console.log(`${Math.floor(100 * index / this._assets.size)} % loaded (${message})`);
    }

    private _assets: Map<string, Asset<AssetTypes>>;
}
