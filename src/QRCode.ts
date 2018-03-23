import { QRCodeModel } from "./QRCodeModel";
import { QRCodeOptions } from "./QRCodeOptions";
import { QRErrorCorrectLevel } from "./QRErrorCorrectLevel";

export class QRCode {
    private _htOption: QRCodeOptions;
    private _element: HTMLElement;
    private _qrCodeModel: QRCodeModel;

    constructor(el: HTMLElement | string, optionOrString: QRCodeOptions | string) {
        this._htOption = {
            width: 256,
            height: 256,
            typeNumber: 4,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRErrorCorrectLevel.H,
            text: undefined,
        };
        let option: QRCodeOptions;
        if (typeof optionOrString === "string") {
            option = {
                text: optionOrString,
            } as QRCodeOptions;
        }

        // Overwrites options
        if (option) {
            for (const key of Object.getOwnPropertyNames(option)) {
                this._htOption[key] = option[key];
            }
        }

        let element: HTMLElement;
        if (typeof el === "string") {
            element = document.getElementById(el);
        } else {
            element = el;
        }

        if (this._htOption.useSVG) {
            Drawing = svgDrawer;
        }

        this._element = element;
        this._oDrawing = new Drawing(this._element, this._htOption);

        if (this._htOption.text) {
            this.makeCode(this._htOption.text);
        }
    }

    makeCode(text: string) {
        this._qrCodeModel = new QRCodeModel(
            _getTypeNumber(text, this._htOption.correctLevel),
            this._htOption.correctLevel,
        );
        this._qrCodeModel.addData(text);
        this._qrCodeModel.make();
        this._element.title = text;
        this._oDrawing.draw(this._qrCodeModel);
        this.makeImage();
    }

    makeImage() {
        if (typeof this._oDrawing.makeImage === "function") {
            this._oDrawing.makeImage();
        }
    }

    clear() {
        this._oDrawing.clear();
    }
}

function _getTypeNumber(sText, nCorrectLevel) {
    let nType = 1;
    const length = _getUTF8Length(sText);

    for (let i = 0, len = QRCodeLimitLength.length; i <= len; i++) {
        let nLimit = 0;

        switch (nCorrectLevel) {
            case QRErrorCorrectLevel.L:
                nLimit = QRCodeLimitLength[i][0];
                break;
            case QRErrorCorrectLevel.M:
                nLimit = QRCodeLimitLength[i][1];
                break;
            case QRErrorCorrectLevel.Q:
                nLimit = QRCodeLimitLength[i][2];
                break;
            case QRErrorCorrectLevel.H:
                nLimit = QRCodeLimitLength[i][3];
                break;
        }

        if (length <= nLimit) {
            break;
        } else {
            nType++;
        }
    }

    if (nType > QRCodeLimitLength.length) {
        throw new Error("Too long data");
    }

    return nType;
}

function _getUTF8Length(text: string) {
    var replacedText = encodeURI(text).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
    return replacedText.length + (replacedText.length != sText ? 3 : 0);
}
