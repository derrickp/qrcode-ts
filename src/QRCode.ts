import { QRErrorCorrectLevel } from "./QRErrorCorrectLevel";

export interface QRCodeHtOption {
    width: number;
    height: number;
    typeNumber: number;
    colorDark: string;
    colorLight: string;
    correctLevel: QRErrorCorrectLevel;
}

export interface QRCodeVOption {
    text: string;
}

export class QRCode {
    private _htOption: QRCodeHtOption;

    constructor(el: HTMLElement, v: QRCodeVOption | string) {
        this._htOption = {
            width: 256,
            height: 256,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.H,
        };
        let vOption: QRCodeVOption;
        if (typeof v === "string") {
            vOption = {
                text: v,
            };
        }

        // Overwrites options
        if (vOption) {
            for (var i in vOption) {
                this._htOption[i] = vOption[i];
            }
        }

        if (typeof el == "string") {
            el = document.getElementById(el);
        }

        if (this._htOption.useSVG) {
            Drawing = svgDrawer;
        }

        this._android = _getAndroid();
        this._el = el;
        this._oQRCode = null;
        this._oDrawing = new Drawing(this._el, this._htOption);

        if (this._htOption.text) {
            this.makeCode(this._htOption.text);
        }
    }
}
