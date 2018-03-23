import { QRCodeModel } from "./QRCodeModel";
import { QRCodeOptions } from "./QRCodeOptions";

export class SVGDrawing {
    constructor(private _element: HTMLElement, private _htOption: QRCodeOptions) {}

    draw(qrCodeModel: QRCodeModel) {
        const _htOption = this._htOption;
        const _el = this._element;
        const nCount = qrCodeModel.getModuleCount();
        const nWidth = Math.floor(_htOption.width / nCount);
        const nHeight = Math.floor(_htOption.height / nCount);

        this.clear();

        const svg = makeSVG("svg", {
            viewBox: "0 0 " + String(nCount) + " " + String(nCount),
            width: "100%",
            height: "100%",
            fill: _htOption.colorLight,
        });
        svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
        _el.appendChild(svg);

        svg.appendChild(makeSVG("rect", { fill: _htOption.colorLight, width: "100%", height: "100%" }));
        svg.appendChild(makeSVG("rect", { fill: _htOption.colorDark, width: "1", height: "1", id: "template" }));

        for (let row = 0; row < nCount; row++) {
            for (let col = 0; col < nCount; col++) {
                if (qrCodeModel.isDark(row, col)) {
                    const child = makeSVG("use", { x: String(col), y: String(row) });
                    child.setAttributeNS("http://www.w3.org/1999/xlink", "href", "#template");
                    svg.appendChild(child);
                }
            }
        }
    }

    clear() {
        while (this._element.hasChildNodes()) {
            this._element.removeChild(this._element.lastChild);
        }
    }
}

export function makeSVG(tag: string, attrs: Canvas2DContextAttributes) {
    const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (const key of Object.getOwnPropertyNames(attrs)) {
        element.setAttribute(key, attrs[key] as string);
    }
    return element;
}

export const useSVG = document.documentElement.tagName.toLowerCase() === "svg";
