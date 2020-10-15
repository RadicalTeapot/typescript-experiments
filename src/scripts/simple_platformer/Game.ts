import { WithFixedStepUpdate } from "../utils/WithFixedStepUpdate";
import { WithKeyboardHandler } from "../utils/WithKeyboardHandler";

class GameClass {

}

export const Game = WithFixedStepUpdate(WithKeyboardHandler(GameClass));
