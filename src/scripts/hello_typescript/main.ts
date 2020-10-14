import {Greeter} from "./greeter";

const greeter = new Greeter(document.getElementById("content") as HTMLElement);
greeter.greet();
