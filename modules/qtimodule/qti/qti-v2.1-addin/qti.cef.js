/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-11-1
 * Time: 下午2:23
 * Copyright @ www.iflytek.com
 */

var QtiCef3 = (function () {
    
    function QtiCef3(options) {
        this.Options = $.extend({}, QtiCef3.defaultOptions, options);
    };
    
    /**
     *与cef交互方法
     * @param cmdRegion
     * @param cmdName
     * @param cmdArgs
     * @param cmdType
     * @param callback
     */
    QtiCef3.prototype.callClient = function (cmdRegion, cmdName, cmdArgs, cmdType, callback) {
        try {
            var funcName = cmdRegion + '.' + cmdName;
            
            if (callback) {
                var wrapper = function (name, args) {
                    callback(args[0]);
                };
                cef.message.sendMessage(funcName, [cmdArgs, cmdType.toString()]);
                cef.message.setMessageCallback(funcName, wrapper);
            } else {
                cef.message.sendMessage(funcName, [cmdArgs, cmdType.toString()]);
            }
        } catch (e) {
            if (callback)
                callback();
        }
    };
    
    /**
     *与壳交互的扩展方法
     * @param cmdName
     * @param cmdArgs
     * @param sucfunc
     * @param failfunc
     */
    QtiCef3.prototype.callClientEx = function (cmdName, cmdArgs, sucfunc, failfunc) {
        this.callClient('SysCmd', cmdName, JSON.stringify(cmdArgs), 0, function (protocol) {
            var result = eval('(' + protocol + ')');
            if (result.flag == 1) {
                sucfunc && sucfunc.call(this, result.data);
            }
            else {
                failfunc && failfunc.call(this, result.flagMsg);
            }
        });
    };
    
    /**
     *从外壳中读取数据
     * @param key
     * @param type
     * @param funcName
     * @param failfunc
     */
    QtiCef3.prototype.readkey = function (key, type, funcName, failfunc) {
        var cmdArgs = JSON.stringify({
            "key": key,
            "type": type
        });
        this.callClient('SysCmd', 'readkey', cmdArgs, 0, function (protocol) {
            var result = eval('(' + protocol + ')');
            if (result.flag == 1) {
                funcName && funcName.call(this, result.data);
            }
            else {
                failfunc.call(this, result.flagMsg);
            }
        });
    };

    /* 设置key */
    QtiCef3.prototype.setkey = function (key, value, type, funcName, failfunc) {
        var cmdArgs = JSON.stringify({
            "key": key.toString(),
            "value": value.toString(),
            "type": type
        });
        this.callClient('SysCmd', 'setkey', cmdArgs, 0, function (protocol) {
            var result = eval('(' + protocol + ')');
            if (result.flag == 1) {
                funcName && funcName.call(this, result.data);
            }
            else {
                failfunc && failfunc.call(this, result.flagMsg);
            }
        });
    };

    /**
    *与服务端交互接口通过壳进行请求转发
    * @param url:服务端接口地址
    * @param params:请求参数
    * @param funcName
    * @param failfunc
    */
    QtiCef3.prototype.postProxy = function (url, params, funcName, failfunc) {
        var cmdArgs = {
            "url": url,
            "params": params
        };
        this.callClient('SysCmd', 'postRequest', JSON.stringify(cmdArgs), 0, function (protocol) {
            $('#waitlayer').hide();
            var result = eval('(' + protocol + ')');
            if (result.flag == 1) {
                var inner = eval('(' + result.data + ')');
                if (inner.flag == 1) {
                    funcName && funcName.call(this, inner.data);
                }
                else {
                    console.error(inner.flagMsg);
                    failfunc && failfunc.call(this, inner.flagMsg);
                }
            }
            else {
                console.error(result.flagMsg);
                failfunc && failfunc.call(this, result.flagMsg);
            }
        });
    };
    
    /* 设置音量 */
    QtiCef3.prototype.setVolume = function (type, volume) {
        var that = this;
        var params = {
            "type": type,
            "volume": volume
        };
        that.callClient('SysCmd', 'setvolume', JSON.stringify(params), 0, function () {
        });
    };

    /* 获取音量 */
    QtiCef3.prototype.getVolume = function (type, callback) {
        var that = this;
        var params = {
            "type": type
        };
        that.callClient('SysCmd', 'getvolume', JSON.stringify(params), 0, function (data) {
            var result = eval('(' + data + ')');
            if (callback) {
                callback.call(this, parseInt(result.data));
            }
        });
    };

    QtiCef3.defaultOptions = {
        //默认异常处理
        exceptionHandler: function (msg) {
            QtiLogger.info("exceptionHandler:" + msg);
        }
    };

    return QtiCef3;

})();