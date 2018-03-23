import { QRMode } from "./QRMode";

let QRCode;

(function() {
    var QRCodeLimitLength = [
        [ 17, 14, 11, 7 ],
        [ 32, 26, 20, 14 ],
        [ 53, 42, 32, 24 ],
        [ 78, 62, 46, 34 ],
        [ 106, 84, 60, 44 ],
        [ 134, 106, 74, 58 ],
        [ 154, 122, 86, 64 ],
        [ 192, 152, 108, 84 ],
        [ 230, 180, 130, 98 ],
        [ 271, 213, 151, 119 ],
        [ 321, 251, 177, 137 ],
        [ 367, 287, 203, 155 ],
        [ 425, 331, 241, 177 ],
        [ 458, 362, 258, 194 ],
        [ 520, 412, 292, 220 ],
        [ 586, 450, 322, 250 ],
        [ 644, 504, 364, 280 ],
        [ 718, 560, 394, 310 ],
        [ 792, 624, 442, 338 ],
        [ 858, 666, 482, 382 ],
        [ 929, 711, 509, 403 ],
        [ 1003, 779, 565, 439 ],
        [ 1091, 857, 611, 461 ],
        [ 1171, 911, 661, 511 ],
        [ 1273, 997, 715, 535 ],
        [ 1367, 1059, 751, 593 ],
        [ 1465, 1125, 805, 625 ],
        [ 1528, 1190, 868, 658 ],
        [ 1628, 1264, 908, 698 ],
        [ 1732, 1370, 982, 742 ],
        [ 1840, 1452, 1030, 790 ],
        [ 1952, 1538, 1112, 842 ],
        [ 2068, 1628, 1168, 898 ],
        [ 2188, 1722, 1228, 958 ],
        [ 2303, 1809, 1283, 983 ],
        [ 2431, 1911, 1351, 1051 ],
        [ 2563, 1989, 1423, 1093 ],
        [ 2699, 2099, 1499, 1139 ],
        [ 2809, 2213, 1579, 1219 ],
        [ 2953, 2331, 1663, 1273 ],
    ];

    // Drawing in DOM by using Table tag
    var Drawing = useSVG
        ? svgDrawer
        : !_isSupportCanvas()
          ? (function() {
                var Drawing = function(el, htOption) {
                    this._el = el;
                    this._htOption = htOption;
                };

                /**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
                Drawing.prototype.draw = function(oQRCode) {
                    var _htOption = this._htOption;
                    var _el = this._el;
                    var nCount = oQRCode.getModuleCount();
                    var nWidth = Math.floor(_htOption.width / nCount);
                    var nHeight = Math.floor(_htOption.height / nCount);
                    var aHTML = [ '<table style="border:0;border-collapse:collapse;">' ];

                    for (var row = 0; row < nCount; row++) {
                        aHTML.push("<tr>");

                        for (var col = 0; col < nCount; col++) {
                            aHTML.push(
                                '<td style="border:0;border-collapse:collapse;padding:0;margin:0;width:' +
                                    nWidth +
                                    "px;height:" +
                                    nHeight +
                                    "px;background-color:" +
                                    (oQRCode.isDark(row, col) ? _htOption.colorDark : _htOption.colorLight) +
                                    ';"></td>',
                            );
                        }

                        aHTML.push("</tr>");
                    }

                    aHTML.push("</table>");
                    _el.innerHTML = aHTML.join("");

                    // Fix the margin values as real size.
                    var elTable = _el.childNodes[0];
                    var nLeftMarginTable = (_htOption.width - elTable.offsetWidth) / 2;
                    var nTopMarginTable = (_htOption.height - elTable.offsetHeight) / 2;

                    if (nLeftMarginTable > 0 && nTopMarginTable > 0) {
                        elTable.style.margin = nTopMarginTable + "px " + nLeftMarginTable + "px";
                    }
                };

                /**
		 * Clear the QRCode
		 */
                Drawing.prototype.clear = function() {
                    this._el.innerHTML = "";
                };

                return Drawing;
            })()
          : (function() {
                // Drawing in Canvas
                function _onMakeImage() {
                    this._elImage.src = this._elCanvas.toDataURL("image/png");
                    this._elImage.style.display = "block";
                    this._elCanvas.style.display = "none";
                }

                // Android 2.1 bug workaround
                // http://code.google.com/p/android/issues/detail?id=5141
                if (this._android && this._android <= 2.1) {
                    var factor = 1 / window.devicePixelRatio;
                    var drawImage = CanvasRenderingContext2D.prototype.drawImage;
                    CanvasRenderingContext2D.prototype.drawImage = function(image, sx, sy, sw, sh, dx, dy, dw, dh) {
                        if ("nodeName" in image && /img/i.test(image.nodeName)) {
                            for (var i = arguments.length - 1; i >= 1; i--) {
                                arguments[i] = arguments[i] * factor;
                            }
                        } else if (typeof dw == "undefined") {
                            arguments[1] *= factor;
                            arguments[2] *= factor;
                            arguments[3] *= factor;
                            arguments[4] *= factor;
                        }

                        drawImage.apply(this, arguments);
                    };
                }

                /**
		 * Check whether the user's browser supports Data URI or not
		 *
		 * @private
		 * @param {Function} fSuccess Occurs if it supports Data URI
		 * @param {Function} fFail Occurs if it doesn't support Data URI
		 */
                function _safeSetDataURI(fSuccess, fFail) {
                    var self = this;
                    self._fFail = fFail;
                    self._fSuccess = fSuccess;

                    // Check it just once
                    if (self._bSupportDataURI === null) {
                        var el = document.createElement("img");
                        var fOnError = function() {
                            self._bSupportDataURI = false;

                            if (self._fFail) {
                                self._fFail.call(self);
                            }
                        };
                        var fOnSuccess = function() {
                            self._bSupportDataURI = true;

                            if (self._fSuccess) {
                                self._fSuccess.call(self);
                            }
                        };

                        el.onabort = fOnError;
                        el.onerror = fOnError;
                        el.onload = fOnSuccess;
                        el.src =
                            "data:image/gif;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="; // the Image contains 1px data.
                        return;
                    } else if (self._bSupportDataURI === true && self._fSuccess) {
                        self._fSuccess.call(self);
                    } else if (self._bSupportDataURI === false && self._fFail) {
                        self._fFail.call(self);
                    }
                }

                /**
		 * Drawing QRCode by using canvas
		 *
		 * @constructor
		 * @param {HTMLElement} el
		 * @param {Object} htOption QRCode Options
		 */
                var Drawing = function(el, htOption) {
                    this._bIsPainted = false;
                    this._android = _getAndroid();

                    this._htOption = htOption;
                    this._elCanvas = document.createElement("canvas");
                    this._elCanvas.width = htOption.width;
                    this._elCanvas.height = htOption.height;
                    el.appendChild(this._elCanvas);
                    this._el = el;
                    this._oContext = this._elCanvas.getContext("2d");
                    this._bIsPainted = false;
                    this._elImage = document.createElement("img");
                    this._elImage.alt = "Scan me!";
                    this._elImage.style.display = "none";
                    this._el.appendChild(this._elImage);
                    this._bSupportDataURI = null;
                };

                /**
		 * Draw the QRCode
		 *
		 * @param {QRCode} oQRCode
		 */
                Drawing.prototype.draw = function(oQRCode) {
                    var _elImage = this._elImage;
                    var _oContext = this._oContext;
                    var _htOption = this._htOption;

                    var nCount = oQRCode.getModuleCount();
                    var nWidth = _htOption.width / nCount;
                    var nHeight = _htOption.height / nCount;
                    var nRoundedWidth = Math.round(nWidth);
                    var nRoundedHeight = Math.round(nHeight);

                    _elImage.style.display = "none";
                    this.clear();

                    for (var row = 0; row < nCount; row++) {
                        for (var col = 0; col < nCount; col++) {
                            var bIsDark = oQRCode.isDark(row, col);
                            var nLeft = col * nWidth;
                            var nTop = row * nHeight;
                            _oContext.strokeStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                            _oContext.lineWidth = 1;
                            _oContext.fillStyle = bIsDark ? _htOption.colorDark : _htOption.colorLight;
                            _oContext.fillRect(nLeft, nTop, nWidth, nHeight);

                            // 안티 앨리어싱 방지 처리
                            _oContext.strokeRect(
                                Math.floor(nLeft) + 0.5,
                                Math.floor(nTop) + 0.5,
                                nRoundedWidth,
                                nRoundedHeight,
                            );

                            _oContext.strokeRect(
                                Math.ceil(nLeft) - 0.5,
                                Math.ceil(nTop) - 0.5,
                                nRoundedWidth,
                                nRoundedHeight,
                            );
                        }
                    }

                    this._bIsPainted = true;
                };

                /**
		 * Make the image from Canvas if the browser supports Data URI.
		 */
                Drawing.prototype.makeImage = function() {
                    if (this._bIsPainted) {
                        _safeSetDataURI.call(this, _onMakeImage);
                    }
                };

                /**
		 * Return whether the QRCode is painted or not
		 *
		 * @return {Boolean}
		 */
                Drawing.prototype.isPainted = function() {
                    return this._bIsPainted;
                };

                /**
		 * Clear the QRCode
		 */
                Drawing.prototype.clear = function() {
                    this._oContext.clearRect(0, 0, this._elCanvas.width, this._elCanvas.height);
                    this._bIsPainted = false;
                };

                /**
		 * @private
		 * @param {Number} nNumber
		 */
                Drawing.prototype.round = function(nNumber) {
                    if (!nNumber) {
                        return nNumber;
                    }

                    return Math.floor(nNumber * 1000) / 1000;
                };

                return Drawing;
            })();

    /**
	 * Get the type by string length
	 *
	 * @private
	 * @param {String} sText
	 * @param {Number} nCorrectLevel
	 * @return {Number} type
	 */

    function _getUTF8Length(sText) {
        var replacedText = encodeURI(sText).toString().replace(/\%[0-9a-fA-F]{2}/g, "a");
        return replacedText.length + (replacedText.length != sText ? 3 : 0);
    }

    /**
	 * @name QRCode.CorrectLevel
	 */
    QRCode.CorrectLevel = QRErrorCorrectLevel;
})();
