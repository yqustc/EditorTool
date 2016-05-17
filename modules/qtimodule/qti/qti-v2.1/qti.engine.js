/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-27
 * Time: 下午3:37
 * Copyright @ www.iflytek.com
 */

/**
 * 控制引擎
 */
var QtiEngine = (function () {

    /**
     * 构造
     */
    function QtiEngine(options) {
        //版本
        this.version = "2.0";

        //类型:paper:试卷；item:小题
        this.pattern = "paper";

        //QTIEngine参数
        this.createOptions = $.extend({}, QtiEngine.defaultOptions, options);

        //分析引擎,分析树结构
        this.paperTree = null;

        //动作工厂
        this.actionFactory = null;

        //动作的队列
        this.actionQueue = null;

        //分析试卷参数
        this.analysisOptions = null;

        //papercode                
        this.paperCode = null;

        //itemArray
        this.itemArray = new Array();

        //当前正在执行的action的id
        this.currentActionId = null;

        //当前的编号
        this.currentSequence = 0;

        //页面状态信息
        this.pageState = new QTICurrentState();

        //所有的页信息
        this.allPageSegments = [];

        //所有的小题信息
        this.allItemSegments = [];
    }

    /**
     * 初始化操作
     */
    QtiEngine.prototype.initialize = function (pattern, param, container, callback) {

        var that = this;
        that.pattern = pattern;
        that.container = container;
        that.returncontent = null;
        //初始化动作工厂
        var factoryOptions = {
            QTIEngine: that,
            testOptions: {
                onstart: that.onTestStart,
                onend: that.onTestEnd,
                ondisplay: that.onTestDisplay
            },
            testpartOptions: {
                onstart: that.onTestPartStart,
                onend: that.onTestPartEnd,
                ondisplay: that.onTestPartDisplay
            },
            sectionOptions: {
                onstart: that.onSectionStart,
                onend: that.onSectionEnd,
                ondisplay: that.onSectionDisplay
            },
            itemOptions: {
                onstart: that.onItemStart,
                onend: that.onItemEnd,
                ondisplay: that.onItemDisplay
            },
            pageOptions: {
                onstart: that.onPageStart,
                onend: that.onPageEnd,
                ondisplay: that.onPageDisplay,
                onprepare: that.onPagePrepare
            },
            extOptions: {
                onrubricshow: that.onRubricShow,
                onplay: that.onPlay,
                onrecord: that.onRecord,
                onwait: that.onWait,
                onstopplay: that.onStopPlay,
                onstoprecord: that.onStopRecord,
                onstopwait: that.onStopWait
            }
        };
        //动作工作中的绑定的动作实现
        that.actionFactory = new QtiActionFactory(factoryOptions);

        switch (that.pattern){
            case IndexService.initializePattern.examPattern:
                that.paperCode = param;
                that.initPaper(that.paperCode, callback);
                break;
            case IndexService.initializePattern.itemDisplayPattern:
                that.itemArray = param;
                that.initItem(that.itemArray, callback);
                break;
            case IndexService.initializePattern.addPattern:
                that.itemContent = param;
                that.itemArray = ['item' + Guid.create()];
                that.initItem(that.itemArray, callback);
                break;
            case IndexService.initializePattern.editPattern:
                var paperXmlPath = param;
                var paperFolderPath = paperXmlPath.substring(0, paperXmlPath.lastIndexOf('\\'));
                top.paperResource.PaperCode = paperFolderPath.substring(paperFolderPath.lastIndexOf('\\') + 1, paperFolderPath.length);
                top.paperResource.PaperPath = paperFolderPath.substring(0, paperFolderPath.lastIndexOf('\\'));
                top.paperResource.PaperFolder = top.paperResource.PaperPath.substring(top.paperResource.PaperPath.lastIndexOf('\\') + 1, top.paperResource.PaperPath.length);
                that.paperCode = top.paperResource.PaperCode;
                that.initPaper(that.paperCode, callback);
                break;
            default :
                QtiLogger.error("[QtiEngine] :: pattern is undefined!");
                if (callback) {
                    callback.apply(that, [false]);
                }
        }


    };

    //初始化试卷
    QtiEngine.prototype.initPaper = function(papercode, callback){
        var that = this;
        //初始化解析引擎
        that.__initPaperTree(papercode, function (success) {
            if (success) {
                //成功加载试卷,加载公共音频
                var commonAudios = that.paperTree.mixedAudios();
                that.downloadFiles(commonAudios, function (isSuccess) {
                    if (!isSuccess) {
                        if (callback) {
                            callback.apply(that, [false]);
                        }
                        return;
                    }

                    //加载动作列表
                    var actionArray = that.paperTree.mixedActions();
                    actionArray = that.__initPageActions(actionArray);

                    that.allItemSegments = that.getAllItemSegment();
                    that.actionQueue = new ActionQueue();
                    that.actionQueue.initialize(actionArray);

                    if (callback) {
                        callback.apply(that, [true]);
                    }
                });
            }
        });
    };

    //初始化解析引擎
    QtiEngine.prototype.__initPaperTree = function (paperXmlFile, callback) {
        var that = this;
        that.analysisOptions = {
            QTIEngine: that,
            actionFactory: that.actionFactory,
            orderingItem: that.createOptions.orderingItem,
            onInsertActionAfter: function (prevActionId, newActions) {
                that.insertActionAfter.apply(that, arguments);
            },
            onSortDisplayActions: function (pagePrepareAction) {
                that.sortDisplayActions.apply(that, arguments);
            },
            onReadXmls: function (xmls, callback) {
                that.readXmls.apply(that, arguments);
            },
            onDownloadFiles: function (files, callback) {
                that.downloadFiles.apply(that, arguments);
            },
            onUnZipFile: function (url, params, timeout, filePath, fileName, callback) {
                that.unZipFile.apply(that, arguments);
            },
            onGetItemAnswers: function (itemIdentifiers, callback) {
                that.getItemAnswers.apply(that, arguments);
            },
            onGetItemRefsIndex: function (sectionIdentifier, itemRefArrayLen, selectionLen, callback) {
                return that.getItemRefIndexBySelection.apply(that, arguments);
            }
        };

        that.getPaperXml(function (resultObj) {
            if (!resultObj.flag || resultObj.flag == 0) {
                if (callback) {
                    callback.apply(that, [false]);
                }
                return;
            }
            var parser = new DOMParser();
            var jqPaperXmlDoc = $(parser.parseFromString(resultObj.data, "text/xml"));
            var $test = jqPaperXmlDoc.find('assessmentTest');
            var test = new AssessmentTest(null, that.analysisOptions);
            test.initialize($test);
            that.paperTree = test;

            if (callback) {
                callback.apply(that, [true]);
            }
        });
    };

    //初始化试题
    QtiEngine.prototype.initItem = function(itemarray, callback){
        var that = this;
        that.analysisOptions = {
            QTIEngine: that,
            actionFactory: that.actionFactory,
            orderingItem: that.createOptions.orderingItem,
            onInsertActionAfter: function (prevActionId, newActions) {
                that.insertActionAfter.apply(that, arguments);
            },
            onSortDisplayActions: function (pagePrepareAction) {
                that.sortDisplayActions.apply(that, arguments);
            },
            onReadXmls: function (xmls, callback) {
                that.readXmls.apply(that, arguments);
            },
            onDownloadFiles: function (files, callback) {
                that.downloadFiles.apply(that, arguments);
            },
            onUnZipFile: function (url, params, timeout, filePath, fileName, callback) {
                that.unZipFile.apply(that, arguments);
            },
            onGetItemAnswers: function (itemIdentifiers, callback) {
                that.getItemAnswers.apply(that, arguments);
            },
            onGetItemRefsIndex: function (sectionIdentifier, itemRefArrayLen, selectionLen, callback) {
                return that.getItemRefIndexBySelection.apply(that, arguments);
            }
        };
        if(itemarray instanceof Array && itemarray.length > 0){
            var date = new Date();
            var actionArray = new Array();
            var itemArray = new Array();
            itemarray.forEach(function(itemId){
                var item = new AssessmentItemRef(null, that.analysisOptions);
                item.identifier = itemId;
                item.href = [itemId, 'item.xml'].join('/');
                item.page = date.toFormatString('yyyyMMddHHmmssfff');
                item.__initActions();
                actionArray = actionArray.concat(item.initialActions);
                itemArray.push(item);
            });
            actionArray = that.__initPageActions(actionArray);

            that.allItemSegments = itemArray;
            that.actionQueue = new ActionQueue();
            that.actionQueue.initialize(actionArray);

            if (callback) {
                callback.apply(that, [true]);
            }
        }
        else{
            if (callback) {
                callback.apply(that, [false]);
            }
        }
    };


    /**
     * 根据规则生成PageAction
     */
    QtiEngine.prototype.__initPageActions = function (actionArray) {
        var that = this;
        var newActions = [];
        var currentPage = null;
        var pageSegement = null;
        var pageIdentifier = [];
        for (var i = 0, len = actionArray.length; i < len; i++) {
            var curAction = actionArray[i];
            var curPage = curAction.host.page;
            if (curPage != currentPage) {
                pageSegement = new AssessmentPage(null, that.analysisOptions, curPage);
                if(that.itemContent){
                    pageSegement.isItemsDownloaded = true;
                    pageSegement.itemXmlHash.add(that.itemArray[0], that.itemContent);
                }
                pageSegement.initialize();

                if (pageIdentifier.length > 0 && pageSegement && pageIdentifier.indexOf(pageSegement.identifier) >= 0) {
                }
                else {
                    this.allPageSegments.push(pageSegement);
                    pageIdentifier.push(pageSegement.identifier);
                    newActions = newActions.concat(pageSegement.actions);
                    currentPage = curPage;
                }
            }
            newActions.push(curAction);

            //如果发现当前的是itemRef_Start节点，则将hostSegement加入到page中
            if (pageSegement && curAction.actionType == QtiActionFactory.actionTypes.item_start) {
                pageSegement.appendItem(curAction.host);
                //只有item有pageObject对象
                curAction.host.pageObject = pageSegement;
            }
        }
        return newActions;
    };

    /**
     *开始流程
     */
    QtiEngine.prototype.start = function (callback) {
        var that = this;
        that.onExamBegin(function(flag){
            if(flag){
                //开始流程时,需要判断是否是恢复
                that.getLastExamRecord(function (resultObj) {
                    var itemIdentifier = resultObj.data;
                    QtiLogger.debug("恢复题：{0}", itemIdentifier);
                    if (itemIdentifier) {
                        //恢复启动
                        that.__onRestarting(itemIdentifier);
                    }
                    else {
                        //默认启动
                        that.__onStarting();
                    }
                    callback && callback.apply(that, [true]);
                });
            }
            else{
                QtiLogger.error("[QtiEngine] :: onExamBeginError");
                callback && callback.apply(that, [false]);
            }
        });
    };

    /** 
      * 从某一题开始恢复启动
      * 需要先执行当前题的pageStart,itemRefdisplay等动作,然后才从pageStart开始执行动作
      */
    QtiEngine.prototype.__onRestarting = function (itemIdentifier) {
        var that = this;
        if (itemIdentifier) {
            var actionId = that.actionQueue.getActionIdByIdentifier(itemIdentifier, QtiActionFactory.actionTypes.page_start);
            if (!actionId) {
                //不是恢复,从第一个Action开始执行
                actionId = that.actionQueue.getFirstActionId();
                that.__execFunc(actionId);
            }
            else {
                that.__execFunc(actionId, itemIdentifier);
            }
        }
        else {
            QtiLogger.debug('OnRestarting:itemIdentifier无定义');
        }
    };

    //执行流程
    QtiEngine.prototype.__onStarting = function (startActionId) {
        var that = this;
        var actionId = that.actionQueue.getFirstActionId();
        if (startActionId) {
            actionId = startActionId;
        }
        that.__execFunc(actionId);
    };

    //递归执行
    QtiEngine.prototype.__execFunc = function (actionId, itemIdentifier) {
        var that = this;
        var action = that.actionQueue.getAction(actionId);
        var flag = action.actionType == QtiActionFactory.actionTypes.page_start ||
            action.actionType == QtiActionFactory.actionTypes.page_prepare ||
            action.actionType == QtiActionFactory.actionTypes.page_display ||
            action.actionType == QtiActionFactory.actionTypes.test_display ||
            action.actionType == QtiActionFactory.actionTypes.testpart_display ||
            action.actionType == QtiActionFactory.actionTypes.section_display ||
            action.actionType == QtiActionFactory.actionTypes.item_display;

        if (itemIdentifier && !flag) {
            actionId = that.actionQueue.getActionIdByIdentifier(itemIdentifier, QtiActionFactory.actionTypes.item_start);
            that.__execFunc(actionId);
        }
        else {
            that.currentActionId = action.actionId;
            action.start(function (act, result) {
                var nextActionId = that.actionQueue.getNextActionId(act.actionId);
                var nextAction = that.actionQueue.getNextAction(act.actionId);
                if (nextActionId && nextAction.actionType != QtiActionFactory.actionTypes.page_start) {
                    that.__execFunc(nextActionId, itemIdentifier);
                }
                else if(nextActionId){
                    QtiLogger.info("当前页面action执行完毕，等待下一页指令");
                    that.onPageEnd();
                }
                else {
                    QtiLogger.info("当前页面action执行完毕，没有action需要执行");
                    that.onPageEnd();
                    that.onExamEnd();
                }
            });
        }
    };

    //下一页
    QtiEngine.prototype.nextPage = function (callback) {
        var that = this;
        that.stopCurrentAction(function () {
            that.getNextPageHostSegmentByMultiChoice(function (data) {
                hostSegment = data;
                if (hostSegment) {
                    that.__onStarting(hostSegment.actions[0].actionId);
                }
                else {
                    if (callback)
                        callback.apply(that, [false, '没有下一页了']);
                }
            }); 
        });
    };

    //根据当前页和当前答题情况获取下一页展示
    //根据当前页和当前页最后一题的跳题规则获取待展示的下一页
    QtiEngine.prototype.getNextPageHostSegmentByMultiChoice = function (callback) {
        var that = this;
        var resultSegment = that.pageState.next;
        var pageChildLen = this.pageState.current.children.length;
        var pageLastItem = pageChildLen > 0 ? this.pageState.current.children[pageChildLen - 1] : null;
        if (pageLastItem && pageLastItem.branchRule.length > 0) {
            //获取答案以及跳题规则
            that.getAnswerHash(pageLastItem, function (answersHash) {
                var flag = false;
                for (var k = 0, lenk = pageLastItem.branchRule.length; k < lenk; k++) {
                    //循环每一条规则
                    var rule = pageLastItem.branchRule[k];
                    if (rule.variable && rule.baseValue) {
                        //读取当前规则涉及小题的答案信息
                        //首先从页面上读取,如果页面上面没有答案,则读取已经保存的答案
                        for (var j = 0, lenj = answersHash.keys().length; j < lenj; j++) {
                            var id = answersHash.keys()[j];
                            var answer = answersHash.items(id);
                            if (rule.variable == id && answer.indexOf(rule.baseValue) >= 0) {
                                var itemRef = that.getItemRefByIdentifier(rule.target);
                                if (itemRef) {
                                    resultSegment = that.getPageByIdentifier("page@" + itemRef.page);
                                    if (callback) {
                                        callback.apply(that, [resultSegment]);
                                    }
                                    flag = true;
                                    break;
                                }
                            }
                        }
                    }
                    else {
                        switch (rule.target) {
                            case BranchRule.exitOptions.EXIT_TEST:
                                if (callback) {
                                    callback.apply(that, [null]);
                                }
                                flag = true;
                                break;
                            case BranchRule.exitOptions.EXIT_TESTPART:
                                break;
                            case BranchRule.exitOptions.EXIT_SECTION:
                                break;
                            default:
                                var itemRef = that.getItemRefByIdentifier(rule.target);
                                if (itemRef) {
                                    resultSegment = that.getPageByIdentifier("page@" + itemRef.page);
                                    if (callback) {
                                        callback.apply(that, [resultSegment]);
                                    }
                                    flag = true;
                                    break;
                                }
                                else {//target=""
                                    if (callback) {
                                        callback.apply(that, [null]);
                                    }
                                    flag = true;
                                    break;
                                }
                        }   
                    }
                    if (flag) {
                        break;
                    }
                }
            });
        }
        else {
            if (callback) {
                callback.apply(that, [resultSegment]);
            }
        }
    }

    //一次性读取跳题所需要的所有答案信息
    QtiEngine.prototype.getAnswerHash = function (itemRef, callback) {
        //读取当前规则涉及小题的答案信息
        //首先从页面上读取,如果页面上面没有答案,则读取已经保存的答案
        var that = this;
        var answersHash = new Hashtable();
        var itemArray = [];
        var idKeys = [];
        for (var k = 0, lenk = itemRef.branchRule.length; k < lenk; k++) {
            //循环每一条规则
            var rule = itemRef.branchRule[k];
            if (rule.variable) {
                var temp = rule.variable.substring(0, rule.variable.lastIndexOf('.'));
                if (!(itemArray.indexOf(temp) >= 0)) {
                    itemArray.push(temp);
                }
                if (!(idKeys.indexOf(rule.variable) >= 0)) {
                    idKeys.push(rule.variable);
                }
            }
        }
        QtiLogger.info("跳题时读取页面中的答案信息");
        answersHash = that.getItemAnswerFromHtml(itemRef);
        that.getItemAnswers(itemArray, function (retObj) {
            if (retObj.flag == 1) {
                QtiLogger.info("跳题时读取文件中的答案信息");
                if (retObj.data) {
                    //将所有答案信息存储起来
                    for (var i = 0, len = idKeys.length; i < len; i++) {
                        var answer = retObj.data[idKeys[i]];
                        if (answersHash.items(idKeys[i])) {
                            //页面答案优先级高
                        }
                        else {
                            //页面无答案,取保存的答案
                            if (answer) {
                                answersHash.add(idKeys[i], answer);
                            }
                        }
                    }
                }
            }
            if (callback) {
                callback.apply(that, [answersHash]);
            }
        });
    };

    //根据当前的item标识符获取小题宿主信息
    QtiEngine.prototype.getItemRefByIdentifier = function (identifier) {
        if (identifier) {
            for (var i = 0, len = this.allItemSegments.length; i < len; i++) {
                if (this.allItemSegments[i].identifier == identifier) {
                    return this.allItemSegments[i];
                }
            }
        } else {
            return null;
        }
    }

    //根据当前的page标识符获取page对象
    QtiEngine.prototype.getPageByIdentifier = function (identifier) {
        if (identifier) {
            for (var i = 0, len = this.allPageSegments.length; i < len; i++) {
                if (this.allPageSegments[i].identifier == identifier) {
                    return this.allPageSegments[i];
                }
            }
        } else {
            return this.pageState.next;
        }
    }

    //从页面读取答案
    QtiEngine.prototype.getItemAnswerFromHtml = function (itemRef) {
        var that = this;
        if (!itemRef.xmlDoc) {
            QtiLogger.debug('AssessmentItemRef.getResponseIdList:还没有成功加载小题xml.');
        }

        var answerHash = new Hashtable();
        var responseIdList = itemRef.getResponseIdList();
        //答案是HashTable
        var arrayHash = AnswerAnalyzerHelper.analyze(responseIdList);
        return arrayHash;
    }

    //上一页
    QtiEngine.prototype.lastPage = function (callback) {
        var that = this;
        that.stopCurrentAction(function () {
            //对于上一页来说，应该找到上上个page_start.
            var lastActionId = that.actionQueue.getPrevActionByType(that.currentActionId, QtiActionFactory.actionTypes.page_start);
            lastActionId = that.actionQueue.getPrevActionByType(lastActionId, QtiActionFactory.actionTypes.page_start);
            if (lastActionId) {
                that.__onStarting(lastActionId);
            } else {
                if (callback)
                    callback.apply(that, [false, '没有上一页了']);
            }
        });
    };

    /**
    * 将所有的item对象合并到一个完整的item列表中
    */
    QtiEngine.prototype.getAllItemSegment = function () {
        var itemRefSegments = [];
        for (var i = 0, ilen = this.allPageSegments.length; i < ilen; i++) {
            var pageSegments = this.allPageSegments[i];
            for (var j = 0, jlen = pageSegments.children.length; j < jlen; j++) {
                itemRefSegments.push(pageSegments.children[j]);
            }
        }
        return itemRefSegments;
    };

    /** 
     * 获取当前page对象的前后page对象
     */
    QtiEngine.prototype.getPrevNextPageSegment = function (curPageHostSegment, allHostSegments) {
        var prevPageHostSegment = null;
        var nextPageHostSegment = null;
        if (curPageHostSegment && allHostSegments) {
            var index = allHostSegments.indexOf(curPageHostSegment);
            if (index > 0) {
                prevPageHostSegment = allHostSegments[index - 1];
            }
            if (index < allHostSegments.length - 1) {
                nextPageHostSegment = allHostSegments[index + 1];
            }
        }
        return [prevPageHostSegment, nextPageHostSegment];
    };

    /**
     * 停止当前在执行的动作
     */
    QtiEngine.prototype.stopCurrentAction = function (callback) {
        //找到当前执行的actionId,并且停止当前Action
        var that = this;
        var actionId = this.currentActionId;
        var action = that.actionQueue.getAction(actionId);
        if (action) {
            action.stop(function () {
                //停止当前动作，找当前动作的宿主的itemEnd动作执行,保存当前题答案
                var itemEndAction = that.actionQueue.getActionByIdentifier(action.host.identifier, QtiActionFactory.actionTypes.item_end);
                if (itemEndAction) {
                    itemEndAction.start(function () {
                        if (callback) {
                            callback.call(that);
                        }
                    });
                }
                else {
                    if (callback) {
                        callback.call(that);
                    }
                }
            });
        } else {
            if (callback) {
                callback.call(that);
            }
        }
    };

    /**
     *排序当前页的所有display的action
     * @param pageAction
     */
    QtiEngine.prototype.sortDisplayActions = function (pageAction) {
        this.actionQueue.sortActionsInPage(pageAction);
    };

    /**
     * 动态插入action,在某元素之后
     */
    QtiEngine.prototype.insertActionAfter = function (prevActionId, additionActionArray) {
        this.actionQueue.insertAfter(prevActionId, additionActionArray);
    };

    /**
     *读取paper.xml
     * @param callback
     */
    QtiEngine.prototype.getPaperXml = function (callback) {
        this.createOptions.QtiResource.getPaperXml(this.paperCode, callback);
    };

    /**
     *下载文件
     * @param files
     * @param callback
     */
    QtiEngine.prototype.downloadFiles = function (files, callback) {
        this.createOptions.QtiResource.downloadFiles(files, callback);
    };

    /**
     *下载并解压文件
     * @param url
     * @param params
     * @param timeout
     * @param filePath
     * @param fileName
     * @param callback
     */
    QtiEngine.prototype.unZipFile = function (url, params, timeout, filePath, fileName, callback) {
        this.createOptions.QtiResource.unZipFile(url, params, timeout, filePath, fileName, callback);
    };

    /**
     *批量读取xml
     * @param xmls
     * @param callback
     */
    QtiEngine.prototype.readXmls = function (xmls, callback) {
        this.createOptions.QtiResource.readXmls(this.paperCode, xmls, callback);
    };
    
    //读取上次作答的记录,进行恢复
    QtiEngine.prototype.getLastExamRecord = function (callback) {
        this.createOptions.QtiResource.getLastExamRecord(callback);
    };

    //读取一页题目的答案信息
    QtiEngine.prototype.getItemAnswers = function (itemIdentifiers, callback) {
        this.createOptions.QtiResource.getItemAnswers(itemIdentifiers, callback);
    };

    QtiEngine.prototype.saveCurrentProgress = function (itemRef, callback) {
        this.createOptions.QtiResource.saveCurrentProgress(itemRef, callback);
    }

    //解析section下面小题,随机选题
    QtiEngine.prototype.getItemRefIndexBySelection = function (sectionIdentifier, itemRefArrayLen, selectionLen, callback) {
        //Section内部随机选题
        var itemIndexArray = [];
        for (var i = 0; i < selectionLen; i++) {
            var itemIndex = Math.floor(Math.random() * itemRefArrayLen);
            while (itemIndexArray.indexOf(itemIndex) >= 0) {
                itemIndex = Math.floor(Math.random() * itemRefArrayLen);
            }
            itemIndexArray.push(itemIndex);
        }
        if (callback) {
            callback.apply(this, [itemIndexArray]);
        }
    };

    //获取题号信息
    QtiEngine.prototype.getCurrentSequence = function () {
        var sequence = ++this.currentSequence;
        return sequence;
    };

    /**
     * 显示rubricblock信息
     * @param action  initArgs:{ rubricNode: $rubricBlock }
     */
    QtiEngine.prototype.onRubricShow = function (action, callback) {
        var rubricHtml = new AbstractHtmlParser().getHtml(action.initArgs.rubricNode);

        var $parent = $(String.format('#{0} .oralInteraction', action.host.identifier));
        $parent.append(rubricHtml);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onPlay = function (action, callback) {
        var that = this;
        var audioFile = action.initArgs.audioFile;
        var playId = action.initArgs.playId;

        QtiLogger.debug('[QtiEngine] :: onPlay : {0}/{1}', playId, audioFile);

        if ((action.host instanceof AssessmentItemRef) && !action.isItemNumAudio) {
            audioFile = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, action.host.identifier, audioFile].join('/');
        }
        else {
            audioFile = [dirName, top.paperResource.PaperFolder, top.paperResource.PaperCode, audioFile].join('/');
        }

        that.createOptions.QtiMedia.playSound(playId, audioFile, function () {
            QtiLogger.debug('[QtiEngine] :: onPlay : 播放完成/{0}', audioFile);
            if (callback) {
                callback.apply(action, [true]);
            }
        }, function(){
            QtiLogger.error('[QtiEngine] :: onPlay : 播放出错/{0}', audioFile);
            if (callback) {
                callback.apply(action, [false]);
            }
        });
    };

    QtiEngine.prototype.onStopPlay = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngine] :: onStopPlay : {0}/{1}', action.initArgs.playId, action.initArgs.audioFile);

        if (action.initArgs.playId) {
            that.createOptions.QtiMedia.stopPlay(action.initArgs.playId);
        }
    };

    QtiEngine.prototype.onRecord = function (action, callback) {
        var that = this;
        var audioFile = action.initArgs.audioFile;
        var audioTime = action.initArgs.audioTime;
        var audioPath = [dirName, top.JXAnswer.AnswerFolder, top.JXAccount.UserID, top.JXPlan.PlanID, action.host.identifier].join('/');
        parent.makeDirs(audioPath, function(){
            audioFile = [audioPath, audioFile].join('/');
            QtiLogger.debug('[QtiEngine] :: onRecord : {0}', audioFile);
            that.createOptions.QtiMedia.record(audioFile, audioTime, function () {
                QtiLogger.debug('[QtiEngine] :: onRecord : 录音完成/{0}', audioFile);
                if (callback) {
                    callback.apply(action, [true]);
                }
            }, function(){
                QtiLogger.error('[QtiEngine] :: onRecord : 录音出错/{0}', audioFile);
                if (callback) {
                    callback.apply(action, [false]);
                }
            });
        });
    };

    QtiEngine.prototype.onStopRecord = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngine] :: onStopRecord : {0}/{1}', action.initArgs.recordId, action.initArgs.audioFile);
        if (action.initArgs.recordId) {
            that.createOptions.QtiMedia.stopRecord(action.initArgs.recordId);
        }
    };

    QtiEngine.prototype.onWait = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onWait : {0}/{1}', action.initArgs.waitId, action.initArgs.waitTime);

        setTimeout(function () {
            if (callback) {
                callback.apply(action, [true]);
            }
        }, action.initArgs.waitTime * 1000);
    };

    QtiEngine.prototype.onStopWait = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngine] :: onStopWait : {0}', action.initArgs.waitId);
        if (action.initArgs.waitId) {
            that.createOptions.QtiMedia.stopWait(action.initArgs.waitId);
        }

    };

    //test
    QtiEngine.prototype.onTestStart = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestStart:' + action.host.identifier);
        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onTestEnd = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestEnd:' + action.host.identifier);
        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onTestDisplay = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestDisplay:' + action.host.identifier);

        var testIdentifier = action.host.identifier;
        //1.判断是否存在主标签
        if ($('#assessment-main').length == 0) {
            $('<div id="assessment-main" class="assessment-main"></div>').appendTo($('body'));
        }

        //2.组织新标签test,插入到html中
        var test_html = '<div class="assessment-test" id="' + testIdentifier + '">' +
            '<div class="title"></div>' +
            '<div class="body"></div>' +
            '</div>';

        if ($(['#', testIdentifier].join('')).length == 0) {
            $('#assessment-main').html(test_html);
        }

        //3.修改相应的名称和内容
        $('#assessment-main').find(['#', testIdentifier, '>.title'].join('')).html(action.host.title);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    //testpart
    QtiEngine.prototype.onTestPartStart = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestPartStart:' + action.host.identifier);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onTestPartEnd = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestPartEnd:' + action.host.identifier);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onTestPartDisplay = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onTestPartDisplay:' + action.host.identifier);

        //0.父级展示
        var parent = action.host.parent;
        var displayAct = parent.getDisplayAction();
        displayAct.start();

        //1.寻找父级标签
        var testIdentifier = action.host.parent.identifier;
        var thisTitle = action.host.title ? action.host.title : '';
        var $parentBody = $(['#', testIdentifier, '>.body'].join(''));

        //2.组织新标签test,插入到html中
        var thisIdentifier = action.host.identifier;
        var test_html = '<div class="assessment-testpart" id="' + thisIdentifier + '">' +
            '<div class="title">' + thisTitle + '</div>' +
            '<div class="body"></div>' +
            '</div>';

        //3.假如不存在，则append上去
        if ($(['#', thisIdentifier].join('')).length == 0) {
            $parentBody.append(test_html);
        }

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    //section
    QtiEngine.prototype.onSectionStart = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onSectionStart:' + action.host.identifier);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onSectionEnd = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onSectionEnd:' + action.host.identifier);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onSectionDisplay = function (action, callback) {

        QtiLogger.debug('[QtiEngine] :: onSectionDisplay:' + action.host.identifier);

        //0.父级展示
        var parent = action.host.parent;
        var displayAct = parent.getDisplayAction();
        displayAct.start();

        //1.寻找父级标签
        var section = action.host;
        var testIdentifier = action.host.parent.identifier;
        var $parentBody = $(['#', testIdentifier, '>.body'].join(''));

        //2.组织rubricblock html
        var title = action.host.title ? action.host.title : '';
        var $rubricBlock = section.jQueryNode.find('rubricBlock').clone();
        var rubricHtml = new AbstractHtmlParser().getHtml($rubricBlock);

        //2.组织新标签test,插入到html中
        var thisIdentifier = action.host.identifier;
        var test_html = '<div class="assessment-section" id="' + thisIdentifier + '">' +
            '<div class="title">' + title + '</div> ' +
            '<div class="header">' + rubricHtml + '</div>' +
            '<div class="body"></div>' +
            '</div>';

        //3.假如不存在，则append上去
        if ($(['#', thisIdentifier].join('')).length == 0) {
            $parentBody.append(test_html);
        }

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    //item
    QtiEngine.prototype.onItemStart = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngine] :: onItemStart:{0}', action.host.identifier);
        that.uploadCurrentProgress(action.host, function () {
            //如果是常规题，也不自动执行下面的
            if (callback && action.host.itemType != AssessmentItemRef.itemTypes.normal) {
                callback.apply(action, [true]);
            }
        });  
    };

    QtiEngine.prototype.onItemEnd = function (action, callback) {

        QtiLogger.debug('[QtiEngine] :: onItemEnd:{0}', action.host.identifier);
        //通知保存答案
        this.onSaveAnswer(action.host);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onItemDisplay = function (action, callback) {
        var that = this;
        QtiLogger.debug('[QtiEngine] :: onItemDisplay:' + action.host.identifier);

        //0.父级展示
        var parent = action.host.parent;
        var displayAct = parent.getDisplayAction();
        displayAct.start();

        //1.寻找父级标签
        var testIdentifier = action.host.parent.identifier;
        var $parentBody = $(['#', testIdentifier, '>.body'].join(''));

        //2.
        var thisIdentifier = action.host.identifier;
        var title = action.host.title ? action.host.title : '';

        if (action.host.cachehtml == '') {
            var item = action.host;
            var $assessmentItem = item.xmlDoc.find('assessmentItem');
            var $itemBody = $assessmentItem.find('itemBody');
            $itemBody.find('sequence').each(function (i) {
                var currentSeq = that.getCurrentSequence();
                item.appendQuestionId(currentSeq);
                var sequence = '<div class="sequence">' + $(this).text() + '</div>';
                $(this).replaceWith(sequence);
            });
            if ($itemBody.find('uploadInteraction').length > 0) {
                item.setIsUpload(true); //上传题
            }
            var childIndex = item.parent.getChildIndex(item);
            var zIndex = 1000 - childIndex;
            var html = HtmlParserHelper.parse(item.identifier, $itemBody).replace('</itemBody>', '').replace('<itemBody>', '');
            var classess = $assessmentItem.attr('class');
            var classessString = classess ? classess : "";
            var itemHtml = '<div class="assessment-item ' + classessString + '" style="z-index:' + zIndex + ';" id="' + item.identifier + '">' + html + '</div>';
            item.setCachehtml(itemHtml);
        }
        //3.组织html
        if ($(['#', thisIdentifier].join('')).length == 0) {
            $parentBody.append(action.host.cachehtml);
        }

        //4.通知恢复答案
        this.onRestoreAnswer(action.host);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    //page
    QtiEngine.prototype.onPageStart = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onPageStart:{0}', action.host.identifier);
        var curHostSegment = action.host;
        var prevNextHostSegment = this.getPrevNextPageSegment(curHostSegment, this.allPageSegments);
        this.pageState.set(prevNextHostSegment[0], curHostSegment, prevNextHostSegment[1]);
        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onPageEnd = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onPageEnd:' + action.host.identifier);

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onPageDisplay = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onPageDisplay:' + action.host.identifier);
        //page的show的话，就清空assessment-main
        if (!this.createOptions.showInOnePage) {
            $('#assessment-main').html('');
        }

        if (callback) {
            callback.apply(action, [true]);
        }
    };

    QtiEngine.prototype.onPagePrepare = function (action, callback) {
        QtiLogger.debug('[QtiEngine] :: onPagePrepare:' + action.host.identifier);

        action.host.prepare(callback);
    };

    //开始考试
    QtiEngine.prototype.onExamBegin = function (callback) {
        QtiLogger.info('[QtiEngine] :: onExamBegin');
        if(callback){
            callback.apply(this, [true]);
        }
    };

    //考试结束
    QtiEngine.prototype.onExamEnd = function () {
        QtiLogger.info('[QtiEngine] :: onExamEnd');
    };

    //保存答案,默认切换item_end的时候
    QtiEngine.prototype.onSaveAnswer = function (item) {
        var itemResIds = item.getResponseIdList();
        var itemAnswerMap = AnswerAnalyzerHelper.analyze(itemResIds);
        this.createOptions.QtiResource.saveAnswers(item, itemAnswerMap, function (data) {
            QtiLogger.debug('[QtiEngine] :: onSaveAnswer:{0}/responseids:{1}/result:{2}', item.identifier, itemResIds.join(','), data.flagMsg);
        });

        QtiLogger.debug('[QtiEngine] :: onSaveAnswer:{0}/responseids:{1}', item.identifier, itemResIds.join(','));
    };

    //恢复答案,默认item_display的时候
    QtiEngine.prototype.onRestoreAnswer = function (item) {
        var itemResIds = item.getResponseIdList();
        QtiLogger.debug('[QtiEngine] :: onRestoreAnswer:{0}/responseids:{1}', item.identifier, itemResIds.join(','));
        var itemRefHash = new Hashtable();
        itemRefHash = item.pageObject.getItemAnswer(item);
        AnswerAnalyzerHelper.setAnswers(itemRefHash);
    };

    /**
     *默认参数
     * @type {{}}
     */
    QtiEngine.defaultOptions = {
        orderingItem: false,  //是否排序item
        showInOnePage: false,  //true:append的在一页中，false:分页显示
        QtiMedia: new QtiMedia(),
        QtiResource: new QtiResource()
    };

    return QtiEngine;
})();

/**
  * current state object.
  */
var QTICurrentState = (function () {
    function QTICurrentState() {
        this.current = null;
        this.previous = null;
        this.next = null;
    }

    QTICurrentState.prototype.set = function (prev, cur, next) {
        this.previous = prev;
        this.current = cur;
        this.next = next;
    };

    QTICurrentState.prototype.get = function () {
        return {
            prev: this.previous,
            cur: this.current,
            next: this.next
        };
    };

    return QTICurrentState;
})();