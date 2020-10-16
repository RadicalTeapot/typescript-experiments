export class Tile {
    x: number;
    y: number;
    spriteName: string;
    constructor(position: [number, number], spriteName: string) {
        this.x = position[0];
        this.y = position[1];
        this.spriteName = spriteName;
    }
}
