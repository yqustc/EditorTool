/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-30
 * Time: 下午9:31
 * Copyright @ www.iflytek.com
 */

var QtiMediaJX = (function (_super) {

    extendClass(QtiMediaJX, _super);

    function QtiMediaJX() {
        _super.apply(this, arguments);
    }

    QtiMediaJX.VadTypes= {
        kNID_SndVadcheckSpeech:16976,//乱说
        kNID_SndVadcheckSilence:16978//不说话检查
    };

    /**
     *录音
     * @param recordId
     * @param audioTime
     * @param audioFile
     * @param key
     * @param ppr
     */
    QtiMediaJX.prototype.record = function (recordId, audioTime, audioFile, type, isVad, examineeId, batchNum, channel, callback, onrecordEnd, onshowVolume) {
        var that = this;
        //1.注册回调map以及在回调后删除回调map
        if (!that.recordMap.contains(recordId)) {
            that.recordMap.add(recordId, function () {
                that.recordMap.remove(recordId);
                if (onrecordEnd) {
                    onrecordEnd.call(that);
                }
            });
        }
        audioFile = "answer/" + examineeId + "/" + batchNum + "/Wav/" + audioFile;
        //type:1别人可以听,type:0别人不可以听
        var params = {
            "callback": recordId,
            "len": parseInt(audioTime),
            "name": audioFile,
            "callback_func": "OnRecordEnd",
            "callback_func_err": "OnPlayError",
            //"notify_waveform":"OnDrawVolume",
            "notify_energy": "OnShowVolume",
            "type": type,
            "channel": channel,
            "vad": isVad ? { "speech": 20, "slience": 20, "callback_func": "OnVadError" } : {}
        };

        that.callClient('SysCmd', 'record', JSON.stringify(params), 1, callback);
    };

    //0-录音，1-放音
    QtiMediaJX.volumeTypes = {
        playVol: 1,
        recordVol: 0
    };

    /* 设置音量 */
    QtiMediaJX.prototype.setVolume = function (playrecord, volume, callback) {
        var that = this;
        var params = {
            "volume": volume,
            "type": playrecord,  //type:操作对象：0-录音，1-放音, 
            "operate": 1 //操作类型：0-读取，1-调节
        };
        that.callClient('SysCmd', 'volume', JSON.stringify(params), 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == 1) {
                if (callback) {
                    callback.call(that, [true]);
                }
            }
            else {
                that.mediaOptions.exceptionHandler.apply(that, ["setVolume:出错！"]);
            }
        });
    };

    /* 获取音量 */
    QtiMediaJX.prototype.getVolume = function (playrecord, callback) {
        var that = this;
        var params = {
            "type": playrecord,  //type:操作对象：0-录音，1-放音, 
            "operate": 0 //操作类型：0-读取，1-调节
        };
        that.callClient('SysCmd', 'volume', JSON.stringify(params), 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == 1) {
                if (callback) {
                    callback.call(that, result.data);
                }
            }
            else {
                that.mediaOptions.exceptionHandler.apply(that, ["getVolume:出错！"]);
            }
        });
    }

    //停止放录音类型
    QtiMediaJX.stopTypes = {
        play: 0,
        record: 1
    };

    //操作类型
    QtiMediaJX.operateTypes = {
        stop: 0,
        pause: 1,
        recover: 2
    }

    //停止放音、录音等功能
    QtiMediaJX.prototype.stop = function (type, operate, callback) {
        var that = this;
        /*type:0放音，1录音；operate:0停止，1暂停，2恢复*/
        var params = {
            "type": type,
            "operate": operate
        };
        that.callClient('SysCmd', 'stop', JSON.stringify(params), 0, function () {
            if (callback) {
                callback.call(that, [true]);
            }
        });
    };

    //发消息
    QtiMediaJX.prototype.sendmessage = function (key, value) {
        var that = this;
        var cmdArgs = JSON.stringify({ "channel": key, "message": value });
        that.callClient('SysCmd', 'sendmessage', cmdArgs, 0, function () { });
    };

    return QtiMediaJX;
})(QtiMedia);
