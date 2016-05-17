/**
 * Created by qianyao on 2015/7/27.
 */
var QtiNW = (function () {

    function QtiNW(options) {
        this.Options = $.extend({}, QtiNW.defaultOptions, options);
    };

    /**
     *从内存中读取数据
     * @param key
     * @param funcName
     */
    QtiNW.prototype.readKey = function (key, funcName, failFunc) {
        this.Options.storeData.get(key, function(err, data){
            if(err){
                QtiLogger.error('[QtiNW] :: readKey :: ' + err);
                failFunc && failFunc.call(this, err);
            }
            else{
                funcName && funcName.call(this, data);
            }
        })
    };

    /* 设置key */
    QtiNW.prototype.setKey = function (key, value, funcName, failFunc) {
        this.Options.storeData.save(key, value, function(err){
            if(err){
                QtiLogger.error('[QtiNW] :: setKey :: ' + err);
                failFunc && failFunc.call(this, err);
            }
            else{
                funcName && funcName.call(this, true);
            }
        });
    };

    /**
     *文件下载接口
     * @param url:服务端接口地址
     * @param params:请求参数
     * @param timeout 超时时间
     * @param filePath 下载路径
     * @param fileName 文件名称
     * @param funcName
     * @param failFunc
     */
    QtiNW.prototype.downloadFile = function (url, params, timeout, filePath, fileName, funcName, failFunc) {
        var options = {};
        options.type = 'POST';
        options.url = url;
        options.data = params;
        options.dataType = 'json';
        options.timeout = timeout ? timeout : 5000;
        options.complete = function(xhr){
            if(xhr.status == 200) {
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath);
                }
                fs.writeFile([filePath, fileName].join('/'), xhr.responseText, 'utf-8', function(err){
                    if(err){
                        failFunc && failFunc.call(this, false);
                    }
                    else{
                        QtiLogger.info('[QtiNW] :: downloadFileSuccess :: path:' + filePath + ', file:' + fileName);
                        funcName && funcName.call(this, true);
                    }
                });
            }
            else{
                QtiLogger.error('[QtiNW] :: downloadFileError :: path:' + filePath + ', file:' + fileName);
                failFunc && failFunc.call(this, false);
            }
        };
        QtiLogger.info('[QtiNW] :: ajax :: ' + JSON.stringify(options));
        $.ajax(options);
    };

    /* 读取xml文件成json */
    QtiNW.prototype.readXml = function (filePath, funcName, failFunc) {
        var that = this;
        fs.readFile(filePath, function(err, data) {
            if(err){
                QtiLogger.error('[QtiNW] :: readXmlError :: path:' + filePath + ', err:' + err);
                failFunc && failFunc.call(this, err);
            }
            else{
                that.Options.xmlParser.parseString(data, function (err, result) {
                    if(err){
                        QtiLogger.error('[QtiNW] :: readXmlError :: path:' + filePath + ', err:' + err);
                        failFunc && failFunc.call(this, err);
                    }
                    else{
                        funcName && funcName.call(this, result);
                    }
                });
            }
        });
    };

    /* 将json写入xml */
    QtiNW.prototype.writeXml = function (jsonData, funcName, failFunc) {
        var xml = this.Options.xmlBuilder.buildObject(jsonData);
    };

    /**
     *与服务端交互接口通过壳进行请求转发
     * @param url:服务端接口地址
     * @param params:请求参数
     * @param funcName
     * @param failFunc
     */
    QtiNW.prototype.postProxy = function (url, formdata, timeout, funcName, failFunc) {
        var options = {};
        options.type = 'POST';
        options.url = url;
        options.data = formdata;
        options.dataType = 'json';
        options.processData = false;
        options.contentType = false;
        //options.contentType = 'application/json; charset=utf-8';
        options.timeout = timeout ? timeout : 5000;
        options.success = function(result){
            if(result.flag == 1){
                QtiLogger.info('[QtiNW] :: PostSuccess :: ' + 'url:' + options.url + ', data:' + result.data);
                funcName && funcName.call(this, result.data);
            }
            else{
                QtiLogger.error('[QtiNW] :: PostError :: ' + 'url:' + options.url + ', data:' + result.flagMsg);
                failFunc && failFunc.call(this, result.flagMsg);
            }
        };
        options.error = function(msg){
            var responseObj = msg.responseText ? eval('(' + msg.responseText + ')') : {flag: 0, data: null, flagMsg: 'error'};
            QtiLogger.error('[QtiNW] :: PostError :: ' + 'msg:' + responseObj.flagMsg);
            failFunc && failFunc.call(this, responseObj.flagMsg);
        };
        QtiLogger.info('[QtiNW] :: ajax :: ' + JSON.stringify(options));
        $.ajax(options);
    };

    /* 设置音量 */
    QtiNW.prototype.setVolume = function (type, volume) {
        var that = this;
        var params = {
            "type": type,
            "volume": volume
        };
        that.callClient('SysCmd', 'setvolume', JSON.stringify(params), 0, function () {
        });
    };

    /* 获取音量 */
    QtiNW.prototype.getVolume = function (type, callback) {
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

    /**
     * 生成xml文件
     * @param path:节点路径
     * @param nodeValue:节点值
     * @param filePath:文件路径
     * @param callback
     */
    QtiNW.prototype.saveAnswerXml = function(path, nodeValue, foldPath, callback){
        var that = this;
        var filePath = [foldPath, top.JXAnswer.XMLName].join('/');
        async.waterfall([function(callback){
            /* 创建路径 */
            parent.makeDirs(foldPath, callback);
        }, function(callback){
            fs.exists(filePath, function(flag){
                if(flag){
                    callback();
                }
                else{
                    fs.writeFile(filePath, top.xmlDeclaration, 'utf-8', function(err){
                        if(err){
                            callback(err);
                        }
                        else{
                            callback();
                        }
                    });
                }
            });
        }, function(callback){
            /* 读取xml */
            fs.readFile(filePath, 'utf-8', function(err, data){
                if(err){
                    callback(err);
                }
                else{
                    callback(null, data);
                }
            });
        }, function(data, callback){
            /* 更新xmlDom */
            var existPath = path;
            var newPath;
            var existNode;
            data = data ? data : top.xmlDeclaration;
            top.JXAnswer.XMLDom = that.Options.domParser.parseFromString(data, 'text/xml');
            while(existPath){
                if(xpath.select(existPath, top.JXAnswer.XMLDom).length > 0){
                    break;
                }
                else{
                    existPath = existPath.substring(0, existPath.lastIndexOf('/'));
                }
            }
            newPath = path.substring(existPath.length, path.length);
            if(!newPath){
                if(existPath){
                    //更新cdata
                    existNode = xpath.select(existPath, top.JXAnswer.XMLDom)[0];
                    existNode.removeChild(existNode.childNodes[0]);
                    existNode.appendChild(top.JXAnswer.XMLDom.createCDATASection(nodeValue.cdata));
                }
            }
            else{
                //追加新节点
                existNode = existPath ? xpath.select(existPath, top.JXAnswer.XMLDom)[0] : top.JXAnswer.XMLDom;
                var nodeArray = newPath.substring(1, newPath.length).split('/');
                var nameArray = new Array();
                var attrJsonArray = new Array();
                for(var i = 0; i < nodeArray.length; i++){
                    if(nodeArray[i].indexOf('[') != -1 && nodeArray[i].indexOf(']') != -1){
                        var attrArray = nodeArray[i].substring(nodeArray[i].indexOf('[') + 1, nodeArray[i].indexOf(']')).split(',');
                        var attrJson = {};
                        for(var j = 0; j < attrArray.length; j++){
                            var key = attrArray[j].split('=')[0].replace(/(^\s+)|(\s+$)/g,"").split('@')[1];
                            var value = attrArray[j].split('=')[1].replace(/(^\s+)|(\s+$)/g,"").split('"')[1];
                            attrJson[key] = value;
                        }
                        nameArray.push(nodeArray[i].substring(0, nodeArray[i].indexOf('[')));
                        attrJsonArray.push(attrJson);
                    }
                    else{
                        nameArray.push(nodeArray[i]);
                        attrJsonArray.push({});
                    }
                }
                parent.appendNewNodes(nameArray, attrJsonArray, nodeValue, existNode, 0, top.JXAnswer.XMLDom);
            }
            callback();
        }, function(callback){
            /* 写入xml */
            var xmlStr = that.Options.xmlSerializer.serializeToString(top.JXAnswer.XMLDom);
            fs.writeFile(filePath, xmlStr, 'utf-8', function(err){
                if(err){
                    callback(err);
                }
                else{
                    callback();
                }
            });
        }], function(err){
            if(err){
                QtiLogger.error('[QtiNW] :: saveAnswerXml :: saveAnswerXmlError');
                callback && callback.call(this, false);
            }
            else{
                QtiLogger.info('[QtiNW] :: saveAnswerXml :: saveAnswerXmlEnd');
                callback && callback.call(this, true);
            }
        });
    };

    QtiNW.defaultOptions = {
        //默认异常处理
        exceptionHandler: function (msg) {
            QtiLogger.info("exceptionHandler:" + msg);
        },
        storeData: new jfs("data"),
        xmlParser: new xml2js.Parser(),
        xmlBuilder: new xml2js.Builder(),
        domParser: new xmldom.DOMParser(),
        xmlSerializer: new xmldom.XMLSerializer(),
        sndUtil: new snd.SndUtil()
    };

    return QtiNW;

})();