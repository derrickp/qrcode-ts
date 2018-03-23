import { QRCodeOptions } from "./QRCodeOptions";

export class CanvasDrawing {
    private _bSupportDataURI: any;
    private _image: HTMLImageElement;
    private _context: CanvasRenderingContext2D;
    private _elCanvas: HTMLCanvasElement;
    private _bIsPainted: boolean;

    constructor(private _element: HTMLElement, private _htOption: QRCodeOptions) {
        this._bIsPainted = false;

        this._elCanvas = document.createElement("canvas");
        this._elCanvas.width = _htOption.width;
        this._elCanvas.height = _htOption.height;
        _element.appendChild(this._elCanvas);
        this._context = this._elCanvas.getContext("2d");
        this._image = document.createElement("img");
        this._image.alt = "Scan me!";
        this._image.style.display = "none";
        _element.appendChild(this._image);
    }
}
