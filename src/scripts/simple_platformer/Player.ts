import { AssetType } from "../utils/AssetLoader";
import { Game } from "./Game";

interface IPlayerParams {
    jumpHeight: number,
    jumpDist: number,
    speed: number,
    gravityMult: number,
    jumpVel: number,
    gravity: number,
};

export class Player {
    /** Position */
    pos: [number, number];//
    /** Velocity */
    vel: [number, number];

    constructor(game: Game, pos: [number, number]) {
        this._game = game;
        this.vel = [0, 0];
        this.pos = pos;
        this._isGrounded = true;
        this._walkImageCounter = 0;
        this._params = {
            jumpHeight: 0,
            jumpDist: 0,
            speed: 0,
            gravityMult: 0,
            jumpVel: 0,
            gravity: 0,

        };
    }

    public loadConfig(config: IPlayerParams) {
        this._params = config;
        const jumpDist = this._params.jumpDist * this._game.renderer.tileSize;
        const jumpHeight = this._params.jumpHeight * this._game.renderer.tileSize;
        // Get length of first part of jump
        let xh = jumpDist / (1 + 1 / Math.sqrt(this._params.gravityMult));
        // Compute jump vertical velocity and gravity using params
        this._params.jumpVel = 2 * jumpHeight * this._params.speed / xh;
        this._params.gravity = 2 * jumpHeight * (this._params.speed ** 2) / (xh ** 2);
    }

    /** Update player position */
    update() {
        // X movement
        this.vel[0] = 0;
        // Collide with screen borders
        if (this._game.keys.left && this.pos[0] > 0)
            this.pos[0] += this.vel[0] = -this._params.speed;
        else if (this._game.keys.right && this.pos[0] <= (this._game.world.width - 1) * this._game.renderer.tileSize)
            this.pos[0] += this.vel[0] = this._params.speed;
        this._walkImageCounter += 0.25;
        if (this.vel[0] === 0)
            this._walkImageCounter = 0;

        // Y movement
        if (this._game.keys.up && this._isGrounded)
            this.vel[1] = -this._params.jumpVel;

        let gravity = this._params.gravity;
        // Alter gravity if player is falling down or let go of jump button
        if (this.vel[1] > 0 || !this._game.keys.up) gravity *= this._params.gravityMult;
        this.pos[1] += this.vel[1] += gravity;
        this._isGrounded = false;
        // Collide with ground
        if (this.vel[1] >= 0 && this.pos[1] >= (this._game.world.height - 2) * this._game.renderer.tileSize) { // Going down
            this.pos[1] = (this._game.world.height - 2) * this._game.renderer.tileSize;
            this.vel[1] = 0;
            this._isGrounded = true;
        }
    }

    /** Render player */
    render() {
        const spriteName = this._walkImageCounter ? `playerWalk${(this._walkImageCounter | 0) % 3 + 1}` : 'playerStand';
        if (this._game.assets.get(AssetType.IMAGE, spriteName)) {
            const image = this._game.assets.get(AssetType.IMAGE, spriteName);
            // Pick correct animation sprite
            this._game.renderer.ctx.save();
            // Flip X axis if player is moving left
            let scaleX = this.vel[0] < 0 ? -1 : 1;
            this._game.renderer.ctx.translate(this.vel[0] < 0 ? this._game.renderer.tileSize : 0, 0);
            this._game.renderer.ctx.scale(scaleX, 1);
            // Dirty scale but works for now
            this._game.renderer.ctx.drawImage(
                image,
                scaleX * this.pos[0], this.pos[1],
                this._game.renderer.tileSize * image.width / image.height, this._game.renderer.tileSize
            );
            this._game.renderer.ctx.restore();
        }
    }

    private _game: Game;
    /** Counter for walk cycle sprites */
    private _walkImageCounter: number;
    /** Whether player is on the ground */
    private _isGrounded: boolean;
    private _params: IPlayerParams;
}
