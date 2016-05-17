/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-30
 * Time: 下午9:31
 * Copyright @ www.iflytek.com
 */

var QtiMedia = (function (_super) {

    extendClass(QtiMedia, _super);

    function QtiMedia(options) {
        _super.apply(this, arguments);
        this.mediaOptions = $.extend({}, this.Options, QtiMedia.defaultOptions, options);

        this.playEndMap = new Hashtable();
        this.recordMap = new Hashtable();
        this.waitMap = new Hashtable();

        this.init();
    }

    QtiMedia.prototype.init = function () {
        var that = this;

        window.OnPlayEnd = function (callback) {
            that.mediaOptions.onPlayEnd.apply(that, arguments);
        };

        window.OnPlayError = function () {
            that.mediaOptions.onPlayError.apply(that, arguments);
        };

        window.OnShowVolume = function () {
            that.mediaOptions.onShowVolume.apply(that, arguments);
        };

        window.OnRecordEnd = function () {
            that.mediaOptions.onRecordEnd.apply(that, arguments);
        };

        //todo:暂时加进来
        if (top) {
            top.OnPlayEnd = OnPlayEnd;
            top.OnRecordEnd = OnRecordEnd;
            top.OnShowVolume = OnShowVolume;
            top.OnPlayError = OnPlayError;
        }
    };

    /**
     * 检测录放音设备
     * @param callback
     */
    QtiMedia.prototype.deviceMonitor = function (callback) {
        var that = this;
        var result = that.Options.sndUtil.deviceMonitor(callback);
        if(result.flag == 0){
            that.Options.exceptionHandler.apply(that, ["deviceMonitor:出错！"]);
        }
    };

    /**
     * 播放音频
     * @param playId
     * @param audioFile
     * @param onPlayEnd
     * @param onPlayError
     */
    QtiMedia.prototype.playSound = function (playId, audioFile, onPlayEnd, onPlayError, onShowEnergy) {
        var that = this;
        var result = that.Options.sndUtil.play(audioFile, onPlayEnd, onPlayError, onShowEnergy);
        if(result.flag == 0){
            that.Options.exceptionHandler.apply(that, ["playSound:出错！"]);
        }
    };

    /**
     *停止播放
     * @param playId
     */
    QtiMedia.prototype.stopPlay = function (playId) {
        var that = this;
        var params = {
            "callback": playId,
            "callback_func": "OnPlayEnd"
        }
        that.callClient('SysCmd', 'stopplay', JSON.stringify(params), 1, function () { });
    };

    /**
     * 录音
     * @param recordId
     * @param audioFile
     * @param audioTime
     * @param onRecordEnd
     * @param onRecordError
     */
    QtiMedia.prototype.record = function (recordId, audioFile, audioTime, onRecordEnd, onRecordError, onShowEnergy) {
        var that = this;
        var result = that.Options.sndUtil.record(audioFile, audioTime, onRecordEnd, onRecordError, onShowEnergy);
        if(result.flag == 0){
            that.Options.exceptionHandler.apply(that, ["record:出错！"]);
        }
    };

    /**
     * 录放音停止
     */
    QtiMedia.prototype.stop = function () {
        var that = this;
        var result = that.Options.sndUtil.stop();
        if(result.flag == 0){
            QtiLogger.info("stop:出错！");
        }
    };

    /**
     *停止录音
     * @param recordId
     */
    QtiMedia.prototype.stopRecord = function (recordId) {
        var that = this;
        var params = {
            "callback": recordId,
            "callback_func": "OnRecordEnd"
        }
        that.callClient('SysCmd', 'stoprecord', JSON.stringify(params), 1, function () { });
    };

    /**
     *停止所有
     */
    QtiMedia.prototype.stopAllPlayOrRecord = function () {
        var that = this;
        var params = {};
        that.callClient('SysCmd', 'stopplay', JSON.stringify(params), 1, function () { });
        that.callClient('SysCmd', 'stoprecord', JSON.stringify(params), 1, function () { });
    };

    /**
     *等待
     */
    QtiMedia.prototype.wait = function () {

    };

    QtiMedia.prototype.stopWait = function (waitId) {

    };

    /**
     *暂停
     */
    QtiMedia.prototype.pause = function () {

    };

    //支持扩展方法
    QtiMedia.defaultOptions = {
        //播放结束
        onPlayEnd: function (callback) {
            var that = this;
            var playId = callback;
            if (that.playEndMap.contains(playId)) {
                that.playEndMap.items(playId).call(that);
            }
        },

        //播放错误
        onPlayError: function (playId) {
            var that = this;
            this.mediaOptions.exceptionHandler.apply(that, ["__onPlayError:出错！"]);
        },

        //显示音量条
        onShowVolume: function (volume) {
            //todo:实现默认的音量值
            //QtiLogger.info("onShowVolume");
        },

        //录音结束
        onRecordEnd: function (callback) {
            //todo:
            QtiLogger.info("onRecordEnd");
        }
    };

    return QtiMedia;
})(QtiNW);