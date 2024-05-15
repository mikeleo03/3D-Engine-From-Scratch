export class Color {
    private _r: number;
    private _g: number;
    private _b: number;
    private _a: number;

    constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 0) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }

    toString() {
        return `rgba(${this._r}, ${this._g}, ${this._b}, ${this._a})`;
    }

    toArray() {
        return [this._r, this._g, this._b, this._a];
    }

    set(r: number, g: number, b: number, a: number=1) {
        this._r = r;
        this._g = g;
        this._b = b;
        this._a = a;
    }

    setHex(hex: string, a: number=this._a) {
        this._r = parseInt(hex.substring(1, 3), 16) / 255;
        this._g = parseInt(hex.substring(3, 5), 16) / 255;
        this._b = parseInt(hex.substring(5, 7), 16) / 255;
        this._a = a;
    }

    copy(c: Color) {
        this.set(c._r, c._g, c._b, c._a);
        return this;
    }

    clone() {
        return new Color(this._r, this._g, this._b, this._a);
    }

    to32bit() {
        return `rgba(${this._r * 255}, ${this._g * 255}, ${this._b * 255}, ${this._a * 255})`;
    }

    get rInt() {
        return this._r * 255;
    }
    
    get gInt() {
        return this._g * 255;
    }

    get bInt() {
        return this._b * 255;
    }

    get aInt() {
        return this._a * 255;
    }

    get hex() {
        return "#" +
        (this._r * 255).toString(16).padStart(2, '0') +
        (this._g * 255).toString(16).padStart(2, '0') +
        (this._b * 255).toString(16).padStart(2, '0');
    }

    static red() {
        return new Color(1, 0, 0, 1);
    }

    static green() {
        return new Color(0, 1, 0, 1);
    }

    static blue() {
        return new Color(0, 0, 1, 1);
    }

    static white() {
        return new Color(1, 1, 1, 1);
    }

    static black() {
        return new Color(0, 0, 0, 1);
    }

    *[Symbol.iterator]() {
        yield this._r;
        yield this._g;
        yield this._b;
        yield this._a;
    }

    toRaw() : number[] {
        return this.toArray();
    }

    static fromRaw(arr: number[]) : Color {
        return new Color(...arr);
    }
}