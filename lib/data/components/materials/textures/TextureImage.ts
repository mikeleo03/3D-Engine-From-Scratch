import { ImageFormat, ImageType } from "@/lib/cores";
import { TextureArrayDataType, TextureImageType } from "@/lib/data/types/gltftypes";
import { ValueOf } from "next/dist/shared/lib/constants";

export type TextureArrayData = {
    width: number;
    height: number;
    bytes: Uint8Array;
};

export class TextureImage {
    private _image?: HTMLImageElement;
    private _arrayData?: TextureArrayData;
    private _format: ValueOf<typeof ImageFormat>;
    private _type: ValueOf<typeof ImageType>;

    constructor(
        data: {
            image?: HTMLImageElement,
            arrayData?: TextureArrayData
        },
        format: ValueOf<typeof ImageFormat>,
        type: ValueOf<typeof ImageType>
    ) {
        const { image, arrayData } = data;

        if (image && arrayData) {
            throw new Error('Cannot have both image and array.');
        }

        if (!image && !arrayData) {
            throw new Error('Must have either image or array.');
        }

        if (arrayData) {
            if (arrayData.width <= 0) {
                throw new Error('Width must be greater than 0.');
            }

            if (arrayData.height <= 0) {
                throw new Error('Height must be greater than 0.');
            }
        }

        this._image = undefined;
        this._arrayData = arrayData;
        this._format = format;
        this._type = type;

        if (image) {
            image.onload = () => {
                this._image = image;
            };
        }
    }

    get arrayData() {
        return this._arrayData;
    }

    get image() {
        return this._image;
    }

    get format() {
        return this._format;
    }

    get type() {
        return this._type;
    }

    toRaw(): TextureImageType {
        return {
            data: {
                image: this._image,
                arrayData: this._arrayData ? {
                    bytes: Array.from(this._arrayData.bytes),
                    width: this._arrayData.width,
                    height: this._arrayData.height
                } : undefined
            },
            format: this._format,
            type: this._type
        };
    }

    static fromRaw(raw: TextureImageType): TextureImage {
        if (raw.data.image && raw.data.arrayData) {
            throw new Error('Cannot have both image and array.');
        }

        if (!raw.data.image && !raw.data.arrayData) {
            throw new Error('Must have either image or array.');
        }

        let image: HTMLImageElement | undefined = undefined;
        let arrayData: TextureArrayData | undefined = undefined;

        if (raw.data.image) {
            image = new Image();
            image.src = raw.data.image!.src;
        }


        else if (raw.data.arrayData) {
            arrayData = {
                bytes: Uint8Array.from(raw.data.arrayData.bytes),
                width: raw.data.arrayData.width,
                height: raw.data.arrayData.height
            };
        }

        return new TextureImage(
            {
                image,
                arrayData,
            },
            raw.format as ValueOf<typeof ImageFormat>,
            raw.type as ValueOf<typeof ImageType>
        );
    }
}