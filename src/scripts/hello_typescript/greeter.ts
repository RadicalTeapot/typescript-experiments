export class Greeter {
    constructor (element: HTMLElement) {
        this._element = element;
    }

    public greet() {
        this._element.innerText = "Hello typescript";
    }

    private _element: HTMLElement;
}
