/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-28
 * Time: 下午2:57
 * Copyright @ www.iflytek.com
 */

var QtiResource = (function (_super) {

    extendClass(QtiResource, _super);

    function QtiResource() {
        _super.apply(this, arguments);
    }

    /**
     *读取当前试卷编号
     * @param callback
     */
    QtiResource.prototype.getCurrentPaperCode = function (callback) {
        var that = this;
        that.readKey('paperId', 2, function (data) {
            if (callback) {
                callback.apply(that, [data])
            }
        });
    };

    /**
     *读取试卷
     * @param papercode
     * @param callback
     */
    QtiResource.prototype.getPaperXml = function (papercode, callback) {
        var that = this;
        var xmlPath = [top.paperResource.PaperPath, papercode, top.paperResource.PaperTemplet].join('/');
        //var parser = new xml2js.Parser();
        fs.readFile(xmlPath, 'utf-8', function(err, data) {
            if(err){
                that.Options.exceptionHandler.apply(that, ["getPaperXml:出错！"]);
            }
            else{
                var firstLine = data.substr(0,data.indexOf('\n'));
                var finalData = data;
                if(firstLine.indexOf('<?') >= 0 && firstLine.indexOf('?>') >= 0){
                    finalData = data.substring(data.indexOf('\n') + 1);
                }
                callback({ "flag": 1, "flagMsg": "成功", "data": finalData });
                /*parser.parseString(data, function (err, result) {
                    if(err){
                        that.Options.exceptionHandler.apply(that, ["getPaperXml:出错！"]);
                    }
                    else{
                        callback({ "flag": 1, "flagMsg": "成功", "data": result });
                    }
                });*/
            }
        });
    };

    //获取上一次答题记录结果
    QtiResource.prototype.getLastExamRecord = function (callback) {
        var that = this;
        var cmdArgs = JSON.stringify({
            "key": 'lastItem',
            "type": 2
        });
        that.callClient('SysCmd', 'readkey', cmdArgs, 0, function (protocol) {
            var result = eval('(' + protocol + ')');
            if (result.flag == that.callClientFlags.SUCCESS) {
                if (callback) {
                    callback.apply(this, [{ flag: 1, flagMsg: '成功', data: result.data }]);
                }
            }
            else {
                if (callback) {
                    callback.apply(this, [{ flag: 1, flagMsg: '成功', data: null }]);
                }
            }
        });
    };

    /**
     *上传答案
     * @param answerArray
     * @param callback
     */
    QtiResource.prototype.uploadAnswer = function (answerArray, callback) {
        QtiLogger.info('[QtiResource] :: onSaveAnswer :: ' + JSON.stringify(answerArray));
        var that = this;
        //callback.apply(this, [false]);
        that.postProxy([ajaxUrl, 'exam/uploadAnswer'].join('/'), answerArray, 10000, function(){
            QtiLogger.info('[QtiResource] :: onSaveAnswer :: onSaveAnswerEnd');
            callback.apply(this, [true]);
        }, function(){
            that.Options.exceptionHandler.apply(that, ["onSaveAnswer:出错！"]);
            callback.apply(this, [false]);
        });
    };

    /**
     *答题完成
     * @param answerArray
     * @param callback
     */
    QtiResource.prototype.examEnd = function (param, callback) {
        QtiLogger.info('[QtiResource] :: onSubmitAnswer :: ' + JSON.stringify(param));
        var that = this;
        //callback.apply(this, [false]);
        that.postProxy([ajaxUrl, 'exam/examEnd'].join('/'), param, 10000, function(data){
            QtiLogger.info('[QtiResource] :: onExamEnd :: onExamEndSuccess');
            callback.apply(this, [true]);
        }, function(){
            that.Options.exceptionHandler.apply(that, ["onExamEnd:出错！"]);
            callback.apply(this, [false]);
        });
    };

    /**
     *读取xml列表
     * @param papercode
     * @param pageXmls
     * @param callback
     */
    QtiResource.prototype.readXmls = function (papercode, pageXmls, callback) {
        var that = this;
        var result = {};
        async.each(pageXmls, function(pageXml, callback) {
            var xmlPath = [top.paperResource.PaperPath, papercode, pageXml.ItemID, top.paperResource.ItemTemplet].join('/');
            fs.readFile(xmlPath, 'utf-8', function(err, data) {
                if(err){
                    callback(err);
                }
                else{
                    var firstLine = data.substr(0,data.indexOf('\n'));
                    var finalData = data;
                    if(firstLine.indexOf('<?') >= 0 && firstLine.indexOf('?>') >= 0){
                        finalData = data.substring(data.indexOf('\n') + 1);
                    }
                    result[pageXml.ItemID] = finalData;
                    callback();
                }
            });
        }, function(err){
            if( err ) {
                that.Options.exceptionHandler.apply(that, ["getItemXml:出错！"]);
                callback({ "flag": 0, "flagMsg": "失败", "data": false });
            } else {
                callback({ "flag": 1, "flagMsg": "成功", "data": result });
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
    QtiResource.prototype.unZipFile = function (url, params, timeout, filePath, fileName, callback) {
        var that = this;
        var extract = unzip.Extract({ path: [filePath, fileName.substr(0, fileName.indexOf('.zip'))].join('/') });
        extract.on('error', function() {
            that.Options.exceptionHandler.apply(that, ["unZipFile:出错！"]);
            QtiLogger.info('[QtiResource] :: unZipFileError :: path:' + filePath + ', file:' + fileName);
            callback({ "flag": 0, "flagMsg": "失败", "data": false });
        });
        extract.on('close', function() {
            QtiLogger.info('[QtiResource] :: unZipFileSuccess :: path:' + filePath + ', file:' + fileName);
            callback({ "flag": 1, "flagMsg": "成功", "data": true });
        });
        request
            .post({ url: url, formData: params, timeout: timeout}, function( err, httpResponse, body){ })
            .on('error', function(){
                that.Options.exceptionHandler.apply(that, ["downloadItem:出错！"]);
                QtiLogger.info('[QtiResource] :: downloadItemError :: path:' + filePath + ', file:' + fileName);
                callback({ "flag": 0, "flagMsg": "失败", "data": false });
            })
            .on('end', function(){
                QtiLogger.info('[QtiResource] :: downloadItemSuccess :: path:' + filePath + ', file:' + fileName);
            })
            .pipe(extract);
    };




    /**
     *下载文件
     * @param audioArrary
     * @param callback
     */
    QtiResource.prototype.downloadFiles = function (audioArrary, callback) {
        //audioArray:音频相对路径的数组
        //下载语音业务,成功后返回结果
        callback.apply(this, [{ flag: true, flagMsg: '下载成功', data: null }]);
    };

    //获取给定小题的答案信息
    //// 返回的答案数组中每个元素是key-value对,key:ItemID,value：答案值
    QtiResource.prototype.getItemAnswers = function (itemArray, callback) {
        var that = this;
        var params = [];
        var len = itemArray.length;
        for (var i = 0; i < len; i++) {
            var key = "item[@id='" + itemArray[i] + "']";
            params.push(key);
        }
        var cmdArgs = JSON.stringify(params);
        that.callClient('SysCmd', 'getanswer', cmdArgs, 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == that.callClientFlags.SUCCESS) {
                var resultdata = {};
                result.data = eval('(' + result.data + ')');
                for (var j = 0; j < len; j++) {
                    var keyInfo = "item[@id='" + itemArray[j] + "']";
                    var value = result.data[keyInfo];
                    if (value) {
                        for (var k = 0, klen = value.length; k < klen; k++) {
                            resultdata[itemArray[j] + '.' + value[k].id] = value[k].answer;
                        }
                    }
                }
                callback({ "flag": 1, "flagMsg": "成功", "data": resultdata });
            }
            else {
                that.Options.exceptionHandler.apply(that, ["getItemAnswers:出错！"]);
            }
        });
    }

    //反馈当前答题的进度
    QtiResource.prototype.saveCurrentProgress = function (itemRef, callback) {
        //保存最后答题的item
        var that = this;
        var params = [];
        params.push({
            key: "/test/info/lastItem", value: "", cdata: itemRef.identifier, attr: {}
        });
        var cmdArgs = JSON.stringify(params);
        that.callClient('SysCmd', 'saveanswer', cmdArgs, 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == 1) {
                callback({ "flag": 1, "flagMsg": "成功", "data": data });
            }
            else {
                that.Options.exceptionHandler.apply(that, ["saveCurrentProgress:出错！"]);
            }
        });
    }

    /**
     *上传答案
     * @param item
     * @param answersHash 每个元素是key-value对,key:response编号,value：答案值
     * @param callback
     */
    QtiResource.prototype.saveAnswers = function (item, answersHash, callback) {
        var that = this;
        var index = 0;
        var params = [];
        var attr = {};
        var testpartId = item.parent.parent.identifier;
        var sectionId = item.parent.identifier;
        var itemId = item.identifier;
        for (var i = 0, len = answersHash.keys().length; i < len; i++) {
            var id = answersHash.keys()[i];
            var answer = answersHash.items(id);
            id = id.slice((item.identifier + ".").length);
            //一个选项值
            var key = String.format('/test/testpart[id={0}]/section[id={1}]/item[id={2}]/response[id={3}]/answer', testpartId, sectionId, itemId, id);
            var obj = { key: key, value: "", cdata: answer, attr: attr };
            params.push(obj);
        }
        var cmdArgs = JSON.stringify(params);
        that.callClient('SysCmd', 'saveanswer', cmdArgs, 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == that.callClientFlags.SUCCESS) {
                callback({ "flag": 1, "flagMsg": "成功", "data": data });
            }
            else {
                that.Options.exceptionHandler.apply(that, ["saveAnswers:出错！"]);
            }
        });
    };

    QtiResource.prototype.OpenDialog = function (id) {
        var that = this;
        var cmdArgs = JSON.stringify({
            "multiselect": false
        });
        that.callClient('SysCmd', 'opendialog', cmdArgs, 0, function (data) {
            var result = eval('(' + data + ')');
            if (result.flag == that.callClientFlags.SUCCESS) {
                var resultdata = {};
                result.data = eval('(' + result.data + ')');
                if (result.data.length > 0) {
                    $('#' + id).html(result.data.join(','));
                }
            }
            else {
                that.Options.exceptionHandler.apply(that, ["OpenDialog:出错！"]);
            }
        });
    };

    //通讯状态
    QtiResource.prototype.callClientFlags = { SUCCESS: 1, FAIL: 0 };

    return QtiResource;
})(QtiNW);
