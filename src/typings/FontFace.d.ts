declare class FontFace {
    constructor(family: string, source: string, descriptors?: FontFace.FontDescriptors);

    status: "unloaded" | "loading" | "loaded" | "error";
    family: string;
    weight: "normal" | "bold" | number;
    style: string;

    load(): Promise<FontFace>;
}

declare namespace FontFace {
    export interface FontDescriptors {
        family?: string;
        weight?: "normal" | "bold" | number;
        style?: string;
    }
}

interface Document {
    fonts: { add: (font: FontFace) => void }
}
