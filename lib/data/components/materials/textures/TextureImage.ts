import { TextureImageType } from "@/lib/data/types/gltftypes";

export class TextureImage {
    private _file: File;

    constructor(file: File) {
        this._file = file;
    }

    get file(): File {
        return this._file;
    }

    set file(value: File) {
        this._file = value;
    }

    get name(): string {
        return this._file.name;
    }

    get size(): number {
        return this._file.size;
    }

    get type(): string {
        return this._file.type;
    }

    async getURI(): Promise<string> {
        const file = this._file;
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (reader.result) {
                    const base64String = reader.result
                        .toString()
                        .split(',')[1]; // Remove the data URL prefix
                    const uri = `data:${file.type};base64,${base64String}`;
                    resolve(uri);
                } else {
                    reject(new Error('Failed to convert file to base64 string.'));
                }
            };
            reader.onerror = () => {
                reject(new Error('Failed to read file.'));
            };
            reader.readAsDataURL(file);
        });
    }

    private static getFileFromURI(uri: string, name: string): File {
        const mimeString = uri.split(',')[0].split(':')[1].split(';')[0];
        const base64String = uri.split(',')[1];
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        return new File([byteArray], name, { type: mimeString });
    }

    async toRaw(): Promise<TextureImageType> {
        return this.getURI().then((uri) => {
            return { uri, name: this.name };
        });
    }

    static fromRaw(raw: TextureImageType): TextureImage {
        const file = TextureImage.getFileFromURI(raw.uri, raw.name);
        return new TextureImage(file);
    }
}