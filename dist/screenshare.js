/**
 * SkyWay-Screenshare-Library - Screenshare Library for SkyWay
 * @version v1.1.0
 * @author NTT Communications(skyway@ntt.com)
 * @link https://github.com/nttcom/SkyWay-ScreenShare
 * @license MIT License
 */
/// <reference path="typings/tsd.d.ts" />
var SkyWay;
(function (SkyWay) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var ScreenShare = (function () {
        function ScreenShare(options) {
            if (typeof options === "undefined") { options = null; }
            this._debug = false;
            if (options !== null && 'debug' in options)
                this._debug = options.debug;
        }
        ScreenShare.prototype.startScreenShare = function (param, success, error, onEndedEvent) {
            var _this = this;
            if (typeof onEndedEvent === "undefined") { onEndedEvent = null; }
            if (!!navigator.mozGetUserMedia) {
                // for FF
                var _paramFirefox = {
                    video: {
                        mozMediaSource: 'window',
                        mediaSource: 'window'
                    },
                    audio: false
                };

                if (isFinite(param.Width))
                    _paramFirefox.video.width = { min: param.Width, max: param.Width };
                if (isFinite(param.Height))
                    _paramFirefox.video.height = { min: param.Height, max: param.Height };
                if (isFinite(param.FrameRate))
                    _paramFirefox.video.frameRate = { min: param.FrameRate, max: param.FrameRate };

                this.logger(_paramFirefox);

                navigator.mozGetUserMedia(_paramFirefox, function (stream) {
                    _this.logger(stream);
                    success(stream);
                }, function (err) {
                    _this.logger(err);
                    error(err);
                });
            } else if (!!navigator.webkitGetUserMedia) {
                // for Chrome
                var _paramChrome = {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: ''
                    },
                    optional: [
                        {
                            googTemporalLayeredScreencast: true
                        }, {
                            googLeakyBucket: true
                        }]
                };

                if (isFinite(param.Width)) {
                    _paramChrome.mandatory.maxWidth = param.Width;
                    _paramChrome.mandatory.minWidth = param.Width;
                }
                ;
                if (isFinite(param.Height)) {
                    _paramChrome.mandatory.maxHeight = param.Height;
                    _paramChrome.mandatory.minHeight = param.Height;
                }
                ;
                if (isFinite(param.FrameRate)) {
                    _paramChrome.mandatory.maxFrameRate = param.FrameRate;
                    _paramChrome.mandatory.minFrameRate = param.FrameRate;
                }
                ;

                window.addEventListener('message', function (event) {
                    _this.logger(event.data.type);
                    if (event.data.type != 'gotStreamId') {
                        return;
                    }
                    _paramChrome.mandatory.chromeMediaSourceId = event.data.streamid;
                    _this.logger(_paramChrome);
                    navigator.getUserMedia({
                        audio: false,
                        video: _paramChrome
                    }, function (stream) {
                        stream.onended = function (event) {
                            _this.logger(event);
                            if (typeof (onEndedEvent) !== "undefined" && onEndedEvent !== null)
                                onEndedEvent();
                        };
                        _this.logger(stream);
                        success(stream);
                    }, function (err) {
                        _this.logger(err);
                        error(err);
                    });
                });

                window.postMessage({ type: "getStreamId" }, "*");
            } else if (typeof (AdapterJS) !== 'undefined' && AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled) {
                // would be fine since no methods
                var _paramIE = {
                    video: {
                        optional: [{
                                sourceId: AdapterJS.WebRTCPlugin.plugin.screensharingKey || 'Screensharing'
                            }]
                    },
                    audio: false
                };

                // wait for plugin to be ready
                AdapterJS.WebRTCPlugin.callWhenPluginReady(function () {
                    // check if screensharing feature is available
                    if (!!AdapterJS.WebRTCPlugin.plugin.HasScreensharingFeature && !!AdapterJS.WebRTCPlugin.plugin.isScreensharingAvailable) {
                        navigator.getUserMedia(_paramIE, function (stream) {
                            stream.onended = function (event) {
                                _this.logger(event);
                                if (typeof (onEndedEvent) !== "undefined")
                                    onEndedEvent();
                            };
                            _this.logger(stream);
                            success(stream);
                        }, function (err) {
                            _this.logger(err);
                            error(err);
                        });
                    } else {
                        throw new Error('Your WebRTC plugin does not support screensharing');
                    }
                });
            }
        };

        ScreenShare.prototype.stopScreenShare = function () {
            // todo : It plans to implement
            return false;
        };

        ScreenShare.prototype.isEnabledExtension = function () {
            if (typeof (window.ScreenShareExtentionExists) === 'boolean' || (typeof (AdapterJS) !== 'undefined' && AdapterJS && AdapterJS.WebRTCPlugin && AdapterJS.WebRTCPlugin.isPluginInstalled)) {
                this.logger('ScreenShare Extension available');
                return true;
            } else {
                this.logger('ScreenShare Extension not available');
                return false;
            }
        };

        ScreenShare.prototype.logger = function (message) {
            if (this._debug) {
                console.log("ScreenShare: " + message);
            }
        };
        return ScreenShare;
    })();
    SkyWay.ScreenShare = ScreenShare;
})(SkyWay || (SkyWay = {}));
