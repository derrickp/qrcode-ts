import { QRErrorCorrectLevel } from "./QRErrorCorrectLevel";

export interface QRCodeOptions {
    [key: string]: any;
    width: number;
    height: number;
    typeNumber: number;
    colorDark: string;
    colorLight: string;
    correctLevel: QRErrorCorrectLevel;
    text: string;
}
