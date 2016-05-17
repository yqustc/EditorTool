/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-11-10
 * Time: 下午2:55
 * Copyright @ www.iflytek.com
 */

var QtiEngineJX = (function (_super) {

    extendClass(QtiEngineJX, _super);

    function QtiEngineJX() {
        _super.apply(this, arguments);
    }

    /**
    *开始流程
    */
    /*QtiEngineJX.prototype.start = function () {
        var that = this;
        that.onExamBegin();
        //默认启动
        that.__onStarting();
    };*/

    /**
      *渲染标签页
      */
    QtiEngineJX.prototype.onTestDisplay = function (action, callback) {
        var that = this;
        QtiLogger.info('[QtiEngineJX] :: onTestDisplay');
        that.container.append('<div class="paper-title">{0}</div>'.format(action.host.title));
        if (callback) {
            callback.apply(this, [true]);
        }
    };

    QtiEngineJX.prototype.onTestPartDisplay = function (action, callback) {
        var that = this;
        QtiLogger.info('[QtiEngineJX] :: onTestPartDisplay');
        that.container.append('<div class="assessment-testpart" id="{0}"><div class="testpart-title"></div><div class="testpart-body"></div></div>'.format(action.host.identifier));
        if (callback) {
            callback.apply(this, [true]);
        }
    };

    QtiEngineJX.prototype.onSectionDisplay = function (action, callback) {
        var that = this;
        QtiLogger.info('[QtiEngineJX] :: onSectionDisplay');
        //0.寻找父级标签
        var testIdentifier = action.host.parent.identifier;
        var $parentBody = that.container.find(['#', testIdentifier, '>.testpart-body'].join(''));

        //1.组织rubricblock html
        var section = action.host;
        var title = action.host.title ? action.host.title : '';
        var $rubricBlock = section.jQueryNode.find('rubricBlock').clone();
        var rubricHtml = new AbstractHtmlParser().getHtml($rubricBlock);

        //2.组织新标签test,插入到html中
        var thisIdentifier = action.host.identifier;
        var test_html = '<div class="assessment-section" id="' + thisIdentifier + '">' +
            '<div class="section-title">' + title + '</div> ' +
            '<div class="section-header">' + rubricHtml + '</div>' +
            '<div class="section-body"></div>' +
            '</div>';

        //3.假如不存在，则append上去
        if ($(['#', thisIdentifier].join('')).length == 0) {
            $parentBody.append(test_html);
        }
        if (callback) {
            callback.apply(this, [true]);
        }
    };

    QtiEngineJX.prototype.onItemDisplay = function (action, callback) {
        QtiLogger.info('[QtiEngineJX] :: onItemDisplay :: ' + action.host.identifier);
        var that = this;
        //1.寻找父级标签
        if(that.pattern == IndexService.initializePattern.examPattern || that.pattern == IndexService.initializePattern.editPattern){
            var testIdentifier = action.host.parent.identifier;
            var $parentBody = that.container.find(['#', testIdentifier, '>.section-body'].join(''));
        }
        else if(that.pattern == IndexService.initializePattern.itemDisplayPattern){
            var $parentBody = $('.main-body');
        }
        else{
            var $parentBody = that.container;
        }

        //2.生成小题html
        var thisIdentifier = action.host.identifier;
        if (action.host.cachehtml == '') {
            var item = action.host;
            var $assessmentItem = item.xmlDoc.find('assessmentItem');
            var $itemBody = $assessmentItem.find('itemBody');
            $itemBody.find('sequence').each(function (i) {
                var currentSeq = that.getCurrentSequence();
                //var currentSeq = Number(thisIdentifier.slice(4));
                item.appendQuestionId(currentSeq);
                var sequence = '<div class="sequence">' + currentSeq + '.' + '</div>';
                $(this).replaceWith(sequence);
            });
            $itemBody.find('img').each(function(){
                var relativeSrc = $(this).attr('src');
                var imgPath = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, thisIdentifier, relativeSrc].join('/');
                $(this).attr('src', imgPath);
            });
            $itemBody.find('object').each(function(){
                var relativeSrc = $(this).attr('data');
                var objPath = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, thisIdentifier, relativeSrc].join('/');
                $(this).attr('data', objPath);
            });
            if ($itemBody.find('uploadInteraction').length > 0) {
                item.setIsUpload(true); //上传题
            }

            if(that.pattern == IndexService.initializePattern.examPattern){
                var childIndex = item.parent.getChildIndex(item);
                var zIndex = 1000 - childIndex;
            }
            else{
                var zIndex = 1000;
            }
            var html = HtmlParserHelper.parse(item.identifier, $itemBody).replace('</itemBody>', '').replace('<itemBody>', '');
            var classess = $assessmentItem.attr('class');
            var classessString = classess ? " " + classess : "";
            var itemHtml = '<div class="assessment-item' + classessString + '" style="z-index:' + zIndex + ';" id="' + item.identifier + '">' + html + '</div>';
            item.setCachehtml(itemHtml);
            that.returncontent = itemHtml;
        }
        //3.组织html
        if ($(['#', thisIdentifier].join('')).length == 0) {
            $parentBody.append(action.host.cachehtml);
            if($('.oralInteraction .progressBar').length > 0){
                $('.oralInteraction .progressBar').QtiProgressBar({ minWidth: '4em'});
            }
        }
        //4.根据模式设置样式
        if(that.pattern == IndexService.initializePattern.addPattern || that.pattern == IndexService.initializePattern.editPattern){
            $parentBody.find('.assessment-item input').css('display', 'none');
            //$parentBody.find('.assessment-item input[type=text]').append('( )');
            $parentBody.find('.assessment-item').find('p').addClass('editable');
            $parentBody.find('.assessment-item').find('.prompt').addClass('editable');
            $parentBody.find('.assessment-item').find('.choiceContent').addClass('editable');
        }
        //5.通知恢复答案
        this.onRestoreAnswer(action.host);
        if (callback) {
            callback.apply(this, [true]);
        }
    };

    QtiEngineJX.prototype.onPageStart = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngineJX] :: onPageStart:{0}', action.host.identifier);
        var curHostSegment = action.host;
        var prevNextHostSegment = this.getPrevNextPageSegment(curHostSegment, this.allPageSegments);
        that.pageState.set(prevNextHostSegment[0], curHostSegment, prevNextHostSegment[1]);
        that.createOptions.QtiMedia.deviceMonitor(function(){});
        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngineJX.prototype.onPageDisplay = function (action, callback) {
        QtiLogger.info('[QtiEngineJX] :: onPageDisplay:' + action.host.identifier);
        //page的show的话，就清空.main-body
        var that = this;
        if(that.pattern == IndexService.initializePattern.examPattern){
            $('.main-body').html('');
        }
        else if(that.pattern == IndexService.initializePattern.editPattern){
            that.container.html('');
        }
        if(this.pageState.previous){
            $('.last-btn').show();
        }
        else{
            $('.last-btn').hide();
        }
        if(this.pageState.next){
            $('.next-btn').show();
            $('.submit-btn').hide();
        }
        else{
            $('.submit-btn').show();
            $('.next-btn').hide();
        }
        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngineJX.prototype.onItemStart = function (action, callback) {
        QtiLogger.info('[QtiEngineJX] :: onItemStart');
        var that = this;

        if (callback) {
            QtiLogger.info('[QtiEngineJX] :: onItemStart::END');
            callback.apply(action, [true]);
        }
    };


    QtiEngineJX.prototype.onItemEnd = function (action, callback) {
        QtiLogger.info('[QtiEngineJX] :: onItemEnd');
        var that = this;
        if (callback) {
            callback.apply(that, [true]);
        }
        //});
    };

    //开始考试
    QtiEngineJX.prototype.onPageEnd = function () {
        QtiLogger.info('[QtiEngineJX] :: onPageEnd');
    };

    //开始考试
    QtiEngineJX.prototype.onExamBegin = function (callback) {
        //获取答卷信息
        var that = this;
        QtiLogger.info('[QtiEngineJX] :: onExamBegin');
        callback && callback.apply(this, [true]);
    };

    //答题成功状态上传
    QtiEngineJX.prototype.onExamEnd = function () {
        QtiLogger.info('[QtiEngineJX] :: onExamEnd');
        QtiLogger.info("TestEnd:flowMsg:答题成功");
        if(this.pattern == IndexService.initializePattern.editPattern){
            start.openInitialized();
        }
    };

    //答题成功状态上传
    QtiEngineJX.prototype.onSubmitEnd = function (param, callback) {
        QtiLogger.info('[QtiEngineJX] :: onSubmitEnd');
        var that = this;
        QtiLogger.info("TestEnd:flowMsg:提交成功");
        that.createOptions.QtiResource.examEnd(param, function(flag){
            if(flag){
                callback.apply(this, [true]);
            }
            else{
                callback.apply(this, [false]);
            }
        });
    };

    //获取小题答案
    QtiEngineJX.prototype.getItemAnswers = function (itemArray, callback) {
        QtiLogger.info('[QtiEngineJX] :: getItemAnswers');
        callback.apply(this, [{ flag: 1, flagMsg: '成功', data: formattedAnswer }]);
    };

    /**
     * 上传答案
     */
    QtiEngineJX.prototype.onSaveAnswer = function(answerArray, callback){
        QtiLogger.info('[QtiEngineJX] :: onSaveAnswer :: ' + JSON.stringify(answerArray));
        var that = this;
        that.createOptions.QtiResource.uploadAnswer(answerArray, function(flag){
           if(flag){
               callback.apply(this, [true]);
           }
           else{
               callback.apply(this, [false]);
           }
        });
    };

    /**
     * 保存answerXml
     */
    QtiEngineJX.prototype.onSaveAnswerXml = function(path, nodeValue, foldPath, callback){
        QtiLogger.info('[QtiEngineJX] :: onSaveAnswerXml :: path:' + path + ', value:' + nodeValue.cdata);
        var that = this;
        that.createOptions.QtiResource.saveAnswerXml(path, nodeValue, foldPath, function(flag){
            if(flag){
                callback.apply(this, [true]);
            }
            else{
                callback.apply(this, [false]);
            }
        });
    };


    /**
     * 停止当前在执行的动作
     */
    QtiEngineJX.prototype.stop = function (callback) {
        //找到当前执行的actionId,并且停止当前Action
        var that = this;
        var actionId = this.currentActionId;
        if (that.actionQueue) {
            var action = that.actionQueue.getAction(actionId);
            clock && clock.stop();
            if (action) {
                action.stop(function () {
                    if (callback) {
                        callback.call(that);
                    }
                });
            } else {
                if (callback) {
                    callback.call(that);
                }
            }
        }else {
            if (callback) {
                callback.call(that);
            }
        }
    };

    QtiEngineJX.prototype.onPlay = function (action, callback) {
        var that = this;
        var audioFile = action.initArgs.audioFile;
        var playId = action.initArgs.playId;

        QtiLogger.debug('[QtiEngineJX] :: onPlay : {0}/{1}', playId, audioFile);

        that.createOptions.QtiMedia.deviceMonitor(function(){
            IndexService.deviceError();
        });

        if ((action.host instanceof AssessmentItemRef) && !action.isItemNumAudio) {
            audioFile = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, action.host.identifier, audioFile].join('/');
        }
        else {
            audioFile = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, audioFile].join('/');
        }
        $('.oralInteraction .clue').text('听指令');
        $('.oralInteraction .progressBar').css('visibility', 'hidden');
        $('.oralInteraction .energyBar').show();
        that.createOptions.QtiMedia.playSound(playId, audioFile, function () {
            QtiLogger.debug('[QtiEngineJX] :: onPlay : 播放完成/{0}', audioFile);
            if (callback) {
                callback.apply(action, [true]);
            }
        }, function(){
            QtiLogger.error('[QtiEngine] :: onPlay : 播放出错/{0}', audioFile);
            if (callback) {
                callback.apply(action, [false]);
            }
        }, function(value){
            QtiLogger.info('[QtiEngineJX] :: onShowVolume : {0}', value);
            IndexService.showVolume(value);
        });
    };

    QtiEngineJX.prototype.onStopPlay = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngineJX] :: onStopPlay : {0}/{1}', action.initArgs.playId, action.initArgs.audioFile);
        that.createOptions.QtiMedia.stop();
        $('.oralInteraction .progressBar').QtiProgressBar('stopWaittime', function(){});
        if(callback){
            callback.apply(that, []);
        }
    };

    QtiEngineJX.prototype.onRecord = function (action, callback) {
        var that = this;
        var recordId = action.initArgs.recordId;
        var audioFile = action.initArgs.audioFile;
        var audioTime = action.initArgs.audioTime;
        var audioPath = [dirName, top.JXAnswer.AnswerFolder, top.JXAccount.UserID, top.JXPlan.PlanID, action.host.identifier].join('/');

        parent.makeDirs(audioPath, function(){
            audioFile = [audioPath, audioFile].join('/');
            QtiLogger.debug('[QtiEngineJX] :: onRecord : {0}', audioFile);

            that.createOptions.QtiMedia.deviceMonitor(function(){
                IndexService.deviceError();
            });

            $('.oralInteraction .clue').text('正在录音');
            $('.oralInteraction .progressBar').QtiProgressBar('waittime', action.initArgs.audioTime, function(){
                $('.record-btn-group').hide();
                $('.oralInteraction .progressBar').css('visibility', 'visible');
            }, function(){ });
            $('.submit-btn').addClass('disabled');
            that.createOptions.QtiMedia.record(recordId, audioFile, audioTime, function () {
                QtiLogger.debug('[QtiEngineJX] :: onRecord : 录音完成/{0}', audioFile);
                $('.oralInteraction').hide();
                $('.submit-btn').removeClass('disabled');
                //文件上传
                var formData = new FormData();
                var answer = new Array();
                var tempJson = {};
                var file = new File(audioFile, action.initArgs.audioFile);
                formData.append('user_id', top.JXAccount.UserID);
                formData.append('plan_id', top.JXPlan.PlanID);
                formData.append('code', top.paperResource.PaperCode);
                formData.append('time', top.JXAccount.UsedTime);
                tempJson['item_id'] = $('.oralInteraction input').attr('name');
                tempJson['type'] = IndexService.itemType.file;
                tempJson['content'] = $('.oralInteraction input').attr('id');
                answer.push(tempJson);
                formData.append('answer', JSON.stringify(answer));
                formData.append(tempJson['content'], file);
                that.onSaveAnswer(formData, function(flag){
                    if(!flag){
                        QtiLogger.error('[QtiEngineJX] :: FileUpload Error!/{0}', audioFile);
                        IndexService.playBack(audioFile, action.initArgs.audioTime);
                        IndexService.recordAgain(audioFile, audioTime);
                        $('.record-again').removeClass('disabled');
                        $('.play-back').removeClass('disabled');
                        $('.record-btn-group').show();
                        var i, j;
                        for(i = 0; i < tosubmitAnswer.length; i++){
                            if(tosubmitAnswer[i]['item_id'] == tempJson['item_id']){
                                tosubmitAnswer[i]['content'] = tempJson['content'];
                                break;
                            }
                        }
                        if(i == tosubmitAnswer.length){
                            tosubmitAnswer.push(tempJson);
                        }
                        for(j = 0; j < tosubmitFile.length; j++){
                            if(tosubmitFile[j]['name'] == $('.oralInteraction input').attr('id')){
                                tosubmitFile[j]['file'] = file;
                                return;
                            }
                        }
                        if(j == tosubmitFile.length){
                            tosubmitFile.push({ name: $('.oralInteraction input').attr('id'), file: file});
                        }
                        if (callback) {
                            callback.apply(action, [true]);
                        }
                    }
                    else{
                        QtiLogger.debug('[QtiEngineJX] :: FileUpload Success!/{0}', audioFile);
                        formattedAnswer[tempJson['item_id']] = tempJson['content'];
                        for(var i = 0; i < tosubmitAnswer.length; i++){
                            if(tosubmitAnswer[i]['item_id'] == tempJson['item_id']){
                                tosubmitAnswer.splice(i,1);
                                break;
                            }
                        }
                        IndexService.playBack(audioFile, action.initArgs.audioTime);
                        IndexService.recordAgain(audioFile, audioTime);
                        $('.record-again').removeClass('disabled');
                        $('.play-back').removeClass('disabled');
                        $('.record-btn-group').show();
                        if (callback) {
                            callback.apply(action, [true]);
                        }
                    }
                });
            }, function(){
                QtiLogger.error('[QtiEngineJX] :: onRecord : 录音出错/{0}', audioFile);
                $('.oralInteraction .progressBar').QtiProgressBar('stopWaittime', function(){});
                if (callback) {
                    callback.apply(action, [false]);
                }
            }, function(value){
                QtiLogger.info('[QtiEngineJX] :: onShowVolume : {0}', value);
                IndexService.showVolume(value);
            });
            $('.oralInteraction .energyBar').show();
        });
    };

    QtiEngineJX.prototype.onStopRecord = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngineJX] :: onStopRecord : {0}/{1}', action.initArgs.recordId, action.initArgs.audioFile);
        that.createOptions.QtiMedia.stop();
        $('.oralInteraction .progressBar').QtiProgressBar('stopWaittime', function(){});
        if(callback){
            callback.apply(that, []);
        }
    };

    QtiEngineJX.prototype.onWait = function (action, callback) {
        QtiLogger.debug('[QtiEngineJX] :: onWait : {0}/{1}', action.initArgs.waitId, action.initArgs.waitTime);
        $('.oralInteraction .clue').text('准备录音');
        $('.oralInteraction .progressBar').css('visibility', 'visible');
        $('.oralInteraction .energyBar').hide();
        $('.oralInteraction .progressBar').QtiProgressBar('waittime', action.initArgs.waitTime, function(){ }, function(){
            QtiLogger.debug('[QtiEngineJX] :: onWait : 准备完成{0}/{1}', action.initArgs.waitId, action.initArgs.waitTime);
            $('.oralInteraction .progressBar').css('visibility', 'hidden');
            if (callback) {
                callback.apply(action, [true]);
            }
        });
    };

    QtiEngineJX.prototype.onStopWait = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngineJX] :: onStopWait : {0}', action.initArgs.waitId);
        $('.oralInteraction .progressBar').QtiProgressBar('stopWaittime', function(){});
        if(callback){
            callback.apply(that, []);
        }
    };


    /**
   * 停止当前在执行的动作
   */
    QtiEngineJX.prototype.stopCurrentAction = function (callback) {
        //找到当前执行的actionId,并且停止当前Action
        var that = this;
        var actionId = this.currentActionId;
        var action = that.actionQueue.getAction(actionId);
        if (action) {
            action.stop(function () {
                if (callback) {
                    callback.call(that);
                }
            });
        } else {
            if (callback) {
                callback.call(that);
            }
        }
    };

    QtiEngineJX.prototype.startByIdentifier = function (nextPage, callback) {
        var that = this;
        that.stopCurrentAction(function () {
            if (nextPage) {
                var itemIdentifier = nextPage.children.length > 0 ? nextPage.children[0].identifier : null;
                if (itemIdentifier) {
                    that.__onRestarting(itemIdentifier);
                } else {
                    if (callback)
                        callback.apply(that, [false, '没有下一页了']);
                }
            } else {
                if (callback)
                    callback.apply(that, [false, '没有下一页了']);
            }
        });
    };


    QtiEngineJX.itemSingals = {
        unstart: 0,
        start: 1
    };

    return QtiEngineJX;
})(QtiEngine);
