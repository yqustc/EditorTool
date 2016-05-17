/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-27
 * Time: 下午3:37
 * Copyright @ www.iflytek.com
 */

/**
 * 解析引擎
 * 解析引擎的目标是解析出资源格式和相应内容
 */

var EnumSegementType = {
    Abstract: 'SEG_Abstract' //virtual segement.
    , AssessmentTest: 'SEG_AssessmentTest'
    , TestPart: 'SEG_TestPart'
    , AssessmentSection: 'SEG_AssessmentSection'
    , AssessmentItemRef: 'SEG_AssessmentItemRef'
};


var AbstractSegement = (function () {

    /**
     * 构造方法
     * @param parent
     * @param options
     * @constructor
     */
    function AbstractSegement(parent, options) {
        this.parent = parent;
        this.segementType = EnumSegementType.Abstract;
        this.analysisOptions = $.extend({}, AbstractSegement.defaultOptions, options);

        this.identifier = null;
        this.title = null;
        this.jqueryNode = null;

        this.children = [];

        this.actions = [];
        this.audios = [];
        this.itemXmls = [];
        this.itemAudios = [];

        //page值
        this.page = null;
        //pageObj对象
        this.pageObj = null;
        //每个部分考试的限制时间,秒为单位
        this.time = -1;
        //this.displayAction
        this.displayAction = null;
    }

    /**
     * 初始化
     * @param jqueryNode
     */
    AbstractSegement.prototype.initialize = function (jqueryNode) {
        throw new Error('not implemented.');
    };

    /**
     *混合语音
     * @returns {Array}
     */
    AbstractSegement.prototype.mixedAudios = function () {
        var audios = this.audios.concat();
        var childrenAudios = [];
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i];
            childrenAudios = childrenAudios.concat(child.mixedAudios());
        }
        return audios.concat(childrenAudios);
    };

    /**
     *混合所有的动作
     * @returns {Array}
     */
    AbstractSegement.prototype.mixedActions = function () {
        var actions = this.actions.concat();
        var childrenActions = [];
        //搜集所有子节点的action
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i];
            childrenActions = childrenActions.concat(child.mixedActions());
        }

        //将所有子节点的action插入到End之前
        var start = actions.length - 1 < 0 ? 0 : (actions.length - 1);
        if (start >= 0 && childrenActions.length > 0) {
            actions.insertArray(start, childrenActions);
        }

        return actions;
    };

    /**
     *混合所有的item
     * @returns {Array}
     */
    AbstractSegement.prototype.mixedItems = function () {
        var items = [];
        var childrenItems = [];
        for (var i = 0, len = this.children.length; i < len; i++) {
            var child = this.children[i];
            childrenItems = childrenItems.concat(child.mixedItems());
        }

        return items.concat(childrenItems);
    };

    /**
     *获取子级的顺序位置
     * @param child
     * @returns {*}
     */
    AbstractSegement.prototype.getChildIndex = function (child) {
        return this.children.indexOf(child);
    };

    /**
     *由底层往上反推page值，如section的page由item反推得到
     */
    AbstractSegement.prototype.backteppingPage = function () {
        for (var i = 0, len = this.children.length; i < len; i++) {
            this.children[i].backteppingPage();
        }
        this.page = this.children[0].page;
    };

    /**
     *用于展示的action
     */
    AbstractSegement.prototype.getDisplayAction = function () {
        return this.displayAction;
    };

    /**
     *解析获取媒体标签对应的动作
     * @param mediaNode
     * @returns {null}
     */
    AbstractSegement.prototype.getMediaAction = function (mediaNode, onNeedAudioDownload) {
        var that = this;
        var action = null;
        var attrAction = mediaNode.attr('action');
        switch (attrAction) {
            case QtiAction.mediaActions.play:
                action = that.__getPlayAction(mediaNode, onNeedAudioDownload);
                break;
            case QtiAction.mediaActions.record:
                action = that.__getRecordAction(mediaNode);
                break;
            case QtiAction.mediaActions.wait:
                action = that.__getWaitAction(mediaNode);
                break;
        }

        return action;
    };

    //play
    AbstractSegement.prototype.__getPlayAction = function (playMediaNode, onNeedAudioDownload) {
        var that = this;
        var audioFile = playMediaNode.attr('file');
        var audioType = playMediaNode.attr('type');
        var audioTitle = playMediaNode.attr('title');
        var view = playMediaNode.attr('view');
        var showprogress = playMediaNode.attr('showprogress');
        var overImg = playMediaNode.attr('overImg');

        var action_factory = that.analysisOptions.actionFactory;
        var play_action = action_factory.create_ext_play_action(that);
        play_action.init({
            playId: Guid.create(),
            audioFile: audioFile,
            audioType: audioType,
            audioTitle: audioTitle,
            view: view,
            showprogress: showprogress,
            overImg: overImg
        });

        if (onNeedAudioDownload) {
            onNeedAudioDownload.apply(that, [audioFile]);
        }

        return play_action;
    };

    //record
    AbstractSegement.prototype.__getRecordAction = function (recordMediaNode) {
        var that = this;
        var audioFile = recordMediaNode.attr('file');
        var audioType = recordMediaNode.attr('type');
        var audioTitle = recordMediaNode.attr('title');
        var audioTime = recordMediaNode.attr('time');
        var responseIdentifier = recordMediaNode.attr('responseIdentifier');
        var view = recordMediaNode.attr('view');
        var showprogress = recordMediaNode.attr('showprogress');
        var pattern = recordMediaNode.attr('pattern');
        var img = recordMediaNode.attr('img');

        var action_factory = that.analysisOptions.actionFactory;
        var record_action = action_factory.create_ext_record_action(that);
        record_action.init({
            recordId: Guid.create(),
            audioFile: audioFile,
            audioType: audioType,
            audioTitle: audioTitle,
            audioTime: audioTime,
            responseId: responseIdentifier,
            view: view,
            showprogress: showprogress,
            pattern: pattern,
            img: img
        });
        return record_action;
    };

    //wait
    AbstractSegement.prototype.__getWaitAction = function (waitMediaNode) {
        var that = this;
        var audioTime = waitMediaNode.attr('time');
        var audioTitle = waitMediaNode.attr('title');
        var view = waitMediaNode.attr('view');
        var showprogress = waitMediaNode.attr('showprogress');
        var fullscreen = waitMediaNode.attr('fullscreen');
        var img = waitMediaNode.attr('img');

        var action_factory = that.analysisOptions.actionFactory;
        var wait_action = action_factory.create_ext_wait_action(that);
        wait_action.init({ waitId: Guid.create(), waitTime: audioTime, waitTitle: audioTitle, view: view, showprogress: showprogress, fullscreen: fullscreen, img: img });
        return wait_action;
    };

    /**
     * 默认参数
     */
    AbstractSegement.defaultOptions = {
        QTIEngine: null,
        actionFactory: null,
        orderingItem: true,
        basePath: '',
        onInsertActionAfter: function (prevActionId, newActions) {
        },
        onSortDisplayActions: function (pagePrepareAction) {
        },
        onReadXmls: function (xmls, callback) {
        },
        onDownloadFiles: function (files, callback) {
        },
        onGetItemAnswers: function (itemIdentifiers, callback) {
        },
        onGetItemRefsIndex: function (sectionIdentifier, itemRefArrayLen, selectionLen, callback) {
            //Section内部随机选题,获取小题索引
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
        }
    };
    return AbstractSegement;
})();


var AssessmentTest = (function (_super) {
    
    extendClass(AssessmentTest, _super);
    
    function AssessmentTest() {
        _super.apply(this, arguments);
        this.segementType = EnumSegementType.AssessmentTest;;
    }
    
    /**
     * assessmentTest初始化方法
     */
    AssessmentTest.prototype.initialize = function (jqueryNode) {
        this.jQueryNode = jqueryNode;
        
        //解析出doc中相关内容
        this.identifier = this.jQueryNode.attr('identifier');
        this.title = this.jQueryNode.attr('title');
        var maxTime = this.jQueryNode.find('AssessmentTest>timeLimits').attr('maxTime');
        this.time = maxTime ? maxTime : -1;
        
        //初始化下一级
        this.__initChildren();
        
        //生成action列表
        this.__initActions();
        
        //处理page值反推
        this.backteppingPage();
    };
    
    /**
     * assessmentTest初始化子节点
     * 递归完成下级到assessmentRef层的子节点的初始化工作
     */
    AssessmentTest.prototype.__initChildren = function () {
        var that = this;
        that.children = [];
        that.jQueryNode.find('testPart').each(function (i) {
            var jqChildNode = $(this);
            
            var testPart = new TestPart(that, that.analysisOptions);
            testPart.initialize(jqChildNode);
            that.children.push(testPart);
        });
    };
    
    /**
     * assessmentTest初始化action列表
     * 先添加test层的默认动作
     */
    AssessmentTest.prototype.__initActions = function () {
        var that = this;
        that.actions.clear();
        that.audios.clear();
        
        var action_factory = that.analysisOptions.actionFactory;
        var start_action = action_factory.create_test_start_action(that);
        var display_action = action_factory.create_test_display_action(that);
        var end_action = action_factory.create_test_end_action(that);
        that.actions.push(start_action, display_action, end_action);
        
        that.displayAction = display_action;
    };
    
    return AssessmentTest;

})(AbstractSegement);


var TestPart = (function (_super) {
    
    extendClass(TestPart, _super);
    
    function TestPart() {
        _super.apply(this, arguments);
        this.segementType = EnumSegementType.TestPart;
    }
    
    TestPart.prototype.initialize = function (jqueryNode) {
        this.jQueryNode = jqueryNode;
        
        //解析出doc中相关内容
        this.identifier = this.jQueryNode.attr('identifier');
        this.title = this.jQueryNode.attr('title');
        var maxTime = this.jQueryNode.find('testPart>timeLimits').attr('maxTime');
        this.time = maxTime ? maxTime : -1;
        
        //初始化下一级
        this.__initChildren();
        
        //初始化动作
        this.__initActions();
    };
    
    TestPart.prototype.__initChildren = function () {
        var that = this;
        that.children = [];
        that.jQueryNode.find('assessmentSection').each(function () {
            var jqChildNode = $(this);
            
            var section = new AssessmentSection(that, that.analysisOptions);
            section.initialize(jqChildNode);
            that.children.push(section);
        });
    };
    
    TestPart.prototype.__initActions = function () {
        var that = this;
        that.actions.clear();
        
        var action_factory = that.analysisOptions.actionFactory;
        var start_action = action_factory.create_testpart_start_action(that);
        var display_action = action_factory.create_testpart_display_action(that);
        var end_action = action_factory.create_testpart_end_action(that);
        that.actions.push(start_action, display_action, end_action);
        
        that.displayAction = display_action;
    };
    
    return TestPart;

})(AbstractSegement);


var AssessmentSection = (function (_super) {
    
    extendClass(AssessmentSection, _super);
    
    function AssessmentSection() {
        _super.apply(this, arguments);
        this.segementType = EnumSegementType.AssessmentSection;
    }
    
    AssessmentSection.prototype.initialize = function (jqueryNode) {
        this.jQueryNode = jqueryNode;
        
        //解析出doc中相关内容
        this.identifier = this.jQueryNode.attr('identifier');
        this.title = this.jQueryNode.attr('title');
        var maxTime = this.jQueryNode.find('assessmentSection>timeLimits').attr('maxTime');
        this.time = maxTime ? maxTime : -1;
        
        //初始化下一级
        this.__initChildren();
        
        //初始化动作
        this.__initActions();
    };
    
    AssessmentSection.prototype.__initChildren = function () {
        var that = this;
        var isOrderingItem = that.analysisOptions.orderingItem;
        var sectionIdentifier = that.jQueryNode.attr('identifier');
        that.children = [];
        var itemAllArray = [];
        var itemArray = [];
        var selection = that.jQueryNode.find('assessmentSection>selection').attr('select');
        that.jQueryNode.find('assessmentItemRef').each(function (i) {
            itemAllArray.push($(this));
        });
        if (selection) {
            var indexArray = [];
            indexArray = that.analysisOptions.onGetItemRefsIndex(sectionIdentifier,itemAllArray.length, selection, function (indexArray) {
                for (var i = 0, ilen = indexArray.length; i < ilen; i++) {
                    var index = indexArray[i];
                    itemArray.push(itemAllArray[index]);
                }
            });
        } else {
            itemArray = itemAllArray;
        }
        var itemIndexArray = [];
        //小题乱序,当前实现section下面的小题乱序,不考虑不同页显示情况
        for (var i = 0, len = itemArray.length; i < len; i++) {
            var itemIndex = i;
            if (isOrderingItem) {
                itemIndex = Math.floor(Math.random() * itemArray.length);
                while (itemIndexArray.indexOf(itemIndex) >= 0) {
                    itemIndex = Math.floor(Math.random() * itemArray.length);
                }
                itemIndexArray.push(itemIndex);
            }
            var description = ('第' + (i + 1) + '小题');
            var jqChildNode = itemArray[itemIndex];

            var itemRef = new AssessmentItemRef(that, that.analysisOptions);
            itemRef.initialize(jqChildNode, description);
            that.children.push(itemRef);
        }
    };
    
    AssessmentSection.prototype.__initActions = function () {
        var that = this;
        that.actions.clear();
        that.audios.clear();
        
        var action_factory = that.analysisOptions.actionFactory;
        
        var start_action = action_factory.create_section_start_action(that);
        var display_action = action_factory.create_section_display_action(that);
        var end_action = action_factory.create_section_end_action(that);
        
        //开始和显示动作
        that.actions.push(start_action, display_action);
        
        //解析中间动作
        var mediaActions = that.__getMediaActions();
        if (mediaActions.length > 0) {
            that.actions = that.actions.concat(mediaActions);
        }
        
        //增加结束动作
        that.actions.push(end_action);
        
        that.displayAction = display_action;
    };
    
    //公共media部分
    AssessmentSection.prototype.__getMediaActions = function () {
        var that = this;
        var mediaActions = [];
        that.jQueryNode.children('mediaBlock').each(function () {
            var act = that.getMediaAction($(this), function (audioFile) {
                if (that.audios.indexOf(audioFile) == -1) {
                    that.audios.push(audioFile);
                }
            });
            
            if (act) {
                mediaActions.push(act);
            }
        });
        return mediaActions;
    };
    
    //组合所有的audios,因为是公共音频，不往下遍历
    AssessmentSection.prototype.mixedAudios = function () {
        return this.audios.concat();
    };
    
    //组合所有的item
    AssessmentSection.prototype.mixedItems = function () {
        return this.children;
    };
    
    AssessmentSection.prototype.backteppingPage = function () {
        if (this.children.length > 0) {
            this.page = this.children[0].page;
        } else {
            //空section生成一个独立的page值
            var date = new Date();
            this.page = date.toFormatString('yyyyMMddHHmmssfff');
        }
    };
    
    return AssessmentSection;

})(AbstractSegement);


var AssessmentItemRef = (function (_super) {
    extendClass(AssessmentItemRef, _super);
    
    function AssessmentItemRef() {
        _super.apply(this, arguments);
        this.segementType = EnumSegementType.AssessmentItemRef;
        
        //初始化时的action列表
        this.initialActions = [];
        
        //item.xml的href
        this.href = null;
        
        //page值
        this.page = null;
        
        //xml
        this.xmlDoc = null;
        
        //小题描述
        this.description = '';
        
        //type=1,听力,type=2,口语题型,type=0,常规题型
        this.itemType = AssessmentItemRef.itemTypes.normal;
        
        //表示小题分值
        this.weights = [];
        
        //标记小题的题号序列信息
        this.questionId = [];

        //缓存小题解析的html内容
        this.cachehtml = '';

        //记录跳题规则
        this.branchRule = [];

        this.required = "true";

        //标识小题是否是上传题
        this.isUpload = false;
    }
    
    AssessmentItemRef.prototype.initialize = function (jqueryNode, description) {
        var that = this;
        this.jQueryNode = jqueryNode;
        this.description = description;
        
        this.identifier = this.jQueryNode.attr('identifier');
        this.href = this.jQueryNode.attr('href');
        
        //weight
        this.jQueryNode.find('assessmentItemRef>weight').each(function (i) {
            that.weights.push($(this).attr('value'));
        });

        this.jQueryNode.find('assessmentItemRef>branchRule').each(function () {
            that.getBranchRule($(this));
        });

        if (that.weights.length == 0) {
            that.weights.push('1.0');
        }
        
        //timelimits
        var maxTime = this.jQueryNode.find('assessmentItemRef>timeLimits').attr('maxTime');
        this.time = maxTime ? maxTime : -1;
        
        //page
        this.page = this.jQueryNode.attr('screen');
        if (!this.page || this.page.trim() == "") {
            var date = new Date();
            this.page = date.toFormatString('yyyyMMddHHmmssfff');
        }
        
        //itemType
        var type = this.jQueryNode.attr('itemType');
        if(type){
            type = type.substring(0,type.indexOf('_'));//listen_S这样的需要去掉后面部分
        }
        if (type != AssessmentItemRef.itemTypes.listen && type != AssessmentItemRef.itemTypes.oral) {
            this.itemType = AssessmentItemRef.itemTypes.normal;
        } else {
            this.itemType = type;
        }
        
        //actions
        this.__initActions();
    };

    //获取跳题规则
    AssessmentItemRef.prototype.getBranchRule = function (ruleNode) {
        var that = this;
        //一条跳题规则
        var rule = new BranchRule();
        var cloneNode = ruleNode.clone();
        var target = cloneNode.attr('target');
        cloneNode.find('match').children().each(function () {
            var tagName = $(this)[0].tagName;
            if (tagName == 'variable') {
                rule.variable = $(this).attr('identifier');
            }
            else if (tagName == 'baseValue') {
                rule.baseValue = $(this).text();
            }
        });
        rule.target = target;
        that.branchRule.push(rule);
    };
    
    //初始化动作列表
    AssessmentItemRef.prototype.__initActions = function () {
        var that = this;
        that.actions.clear();
        that.audios.clear();
        that.initialActions.clear();

        var action_factory = that.analysisOptions.actionFactory;
        var start_action = action_factory.create_item_start_action(that);
        var end_action = action_factory.create_item_end_action(that);
        that.initialActions.push(start_action, end_action);

        //media,题号提示音
        if(that.jQueryNode){
            that.jQueryNode.find('assessmentItemRef>mediaBlock').each(function (i) {
                var act = that.getMediaAction($(this), function (audioFile) {
                    if (audioFile && that.audios.indexOf(audioFile) == -1) {
                        that.audios.push(audioFile);
                    }
                });
                act.isItemNumAudio = true;//是否是题号音频，是的话，是从公共音中查找音频
                that.actions.push(act);
            });
        }
    };
    
    //初始化小题xml
    AssessmentItemRef.prototype.initItemXml = function (itemXmlString) {
        var parser = new DOMParser();
        this.xmlDoc = $(parser.parseFromString(itemXmlString, "text/xml"));
        
        var $assessmentItem = this.xmlDoc.find('assessmentItem');
        this.title = $assessmentItem.attr('title');
        
        this.__initRealActions();
    };
    
    //初始化实际的流程action
    AssessmentItemRef.prototype.__initRealActions = function () {
        var that = this;
        var action_factory = that.analysisOptions.actionFactory;
        var start_action = that.initialActions[0];
        var end_action = that.initialActions[this.initialActions.length - 1];
        var itemNumAudioActs = that.actions;

        that.actions = [];

        //item_start
        that.actions.push(start_action);

        //item_display
        var display_action = action_factory.create_item_display_action(that);
        that.actions.push(display_action);

        //copy other media actions
        for (var i = 0, len = itemNumAudioActs.length; i < len; i++) {
            that.actions.push(itemNumAudioActs[i]);
        }

        //media actions.
        var $assessmentItem = this.xmlDoc.find('assessmentItem');
        $assessmentItem.find('itemBody>mediaBlock').each(function (i) {
            var act = that.getMediaAction($(this), function (audioFile) {
                if (audioFile && that.audios.indexOf(audioFile) == -1) {
                    that.audios.push(audioFile);
                }
            });
            that.actions.push(act);
        });

        //oralInteraction.
        $assessmentItem.find('oralInteraction').children().each(function () {
            var tagName = $(this)[0].tagName;
            switch (tagName) {
                case 'mediaBlock': {
                    var act = that.getMediaAction($(this), function (audioFile) {
                        if (audioFile && that.audios.indexOf(audioFile) == -1) {
                            that.audios.push(audioFile);
                        }
                    });
                    that.actions.push(act);
                    break;
                }
                case 'rubricBlock': {
                    var $rubricBlock = $(this).clone();
                    var rubric_action = action_factory.create_ext_rubricshow_action(that);
                    rubric_action.init({ rubricNode: $rubricBlock });
                    that.actions.push(rubric_action);
                    break;
                }
                default: {
                    break;
                }
            }
        });

        //end action.
        that.actions.push(end_action);

        that.displayAction = display_action;
    };
    
    //获取响应单位题目的id列表
    AssessmentItemRef.prototype.getResponseIdList = function () {
        if (!this.xmlDoc) {
            throw new Error('AssessmentItemRef.getResponseIdList:还没有成功加载小题xml.');
        }
        
        var that = this;
        var array = [];
        var $assessmentItem = this.xmlDoc.find('assessmentItem');
        if ($assessmentItem) {
            $assessmentItem.find('responseDeclaration').each(function () {
                array.push(that.identifier + "." + $(this).attr('identifier'));
            });
        }
        
        return array;
    };
    
    //获取当前的action列表，在page初始化后是不一样的
    AssessmentItemRef.prototype.mixedActions = function () {
        return this.initialActions;
    };
    
    //缓存小题的html信息
    AssessmentItemRef.prototype.setCachehtml = function (cachehtml) {
        this.cachehtml = cachehtml;
    }

    //设置是否上传题
    AssessmentItemRef.prototype.setIsUpload = function (isUpload) {
        this.isUpload = isUpload;
    }

    //设置题号信息
    AssessmentItemRef.prototype.appendQuestionId = function (questionId) {
        this.questionId.push(questionId);
    }

    //题型类型
    AssessmentItemRef.itemTypes = {
        normal: 'normal',  //常规题
        listen: 'listen',  //听力题
        oral: 'oral'     //口语题
    };
    
    return AssessmentItemRef;

})(AbstractSegement);


var AssessmentPage = (function (_super) {
    extendClass(AssessmentPage, _super);
    
    function AssessmentPage(parent, analysisOptions, pageValue) {
        _super.apply(this, arguments);
        
        this.identifier = 'page@' + pageValue;
        
        //prop
        this.isInitialized = false;

        //页面小题资源是否已经下载成功
        this.isItemsDownloaded = false;
        
        //item.xml的资源列表
        this.itemXmlHash = new Hashtable();
        
        //一页显示的所有小题的答案信息
        this.answersHash = new Hashtable();
    }
    
    //initialize the page on the tree.
    AssessmentPage.prototype.initialize = function () {
        this.isInitialized = false;
        
        //初始化默认的action信息
        this.__initActions();
    };
    
    //初始化动作
    AssessmentPage.prototype.__initActions = function () {
        var that = this;
        that.actions.clear();
        that.audios.clear();
        
        var action_factory = that.analysisOptions.actionFactory;
        var start_action = action_factory.create_page_start_action(that);
        var display_action = action_factory.create_page_display_action(that);
        var prepare_action = action_factory.create_page_prepare_action(that);
        //暂时不需要 page_end_action
        var end_action = action_factory.create_page_end_action(that);
        
        that.actions.push(start_action, display_action, prepare_action);
        
        //todo:暂时没有加入end_action
        that.displayAction = display_action;
    };
    
    //添加小题
    AssessmentPage.prototype.appendItem = function (itemRef) {
        if (this.children.indexOf(itemRef) == -1) {
            this.children.push(itemRef);
        }
    };
    
    //prepare resource and answers for this screen.
    AssessmentPage.prototype.prepare = function (callback) {
        var that = this;
        if (!that.isInitialized) {
            //1.show waiting.
            that.__showWait();
            
            //2. download items xml
            that.__downloadItemsXml(function (ret) {
                if (!ret) {
                    that.__onPreparingError();
                    return;
                }
                
                //3.initialize items xml
                that.__initItemsXml(function (ret) {
                    if (!ret) {
                        that.__onPreparingError();
                        return;
                    }
                    
                    //4. download items audio
                    that.__downloadItemsAudio(function (ret) {
                        if (!ret) {
                            that.__onPreparingError();
                            return;
                        }
                        //5. read items answers
                        that.__getAnswerHash(function (ret) {
                            if (!ret) {
                                that.__onPreparingError();
                                return;
                            }
                            //6.prepare resource success.
                            that.__onPreparingSuccess(callback);
                        });
                    })
                })
            });
        } else {
            
            //5. read items answers
            that.__getAnswerHash(function (ret) {
                if (!ret) {
                    that.__onPreparingError();
                    return;
                }
                if (callback) {
                    callback.apply(that, [false]);
                }
            });
        }
    };
    
    //0. on error.
    AssessmentPage.prototype.__onPreparingError = function (callback) {
        QtiLogger.info("加载资源失败");
        this.__hideWait();
        //告知结果
        if (callback) {
            callback.apply(this, [false]);
        }
    };
    
    //0. on success.
    AssessmentPage.prototype.__onPreparingSuccess = function (callback) {
        QtiLogger.info("AssessmentPage.__onPreparingSuccess :: {0} 成功加载资源", this.identifier);
        //关闭等待效果
        this.__hideWait();
        
        //组织action，放入actionQueue中
        this.__appendItemActions();
        
        this.isInitialized = true;
        
        //告知加载结构
        if (callback) {
            callback.apply(this, [true]);
        }
    };
    
    //0.插入解析后的action
    AssessmentPage.prototype.__appendItemActions = function () {
        var that = this;
        var displayActions = [];
        var prevActionId, newActions, curAction;
        for (var i = 0, len = this.children.length; i < len; i++) {
            var itemRef = this.children[i];
            var actions = itemRef.actions;
            
            prevActionId = null;
            newActions = [];
            for (var k = 0, actionLength = actions.length; k < actionLength; k++) {
                curAction = actions[k];
                //取得item的开头action
                if (!prevActionId && curAction.actionType == QtiActionFactory.actionTypes.item_start) {
                    prevActionId = curAction.actionId;
                }
                //其他的只要不是End的action，都加入新增队列中
                else if (curAction.actionType != QtiActionFactory.actionTypes.item_end) {
                    newActions.push(curAction);
                }
            }
            that.analysisOptions.onInsertActionAfter.apply(that.analysisOptions.QTIEngine, [prevActionId, newActions]);
        }
        
        //将当前页的display的action排到一起
        var pagePrepare = this.actions[2];
        that.analysisOptions.onSortDisplayActions.apply(that.analysisOptions.QTIEngine, [pagePrepare]);
    };
    
    //0. show waitting.
    AssessmentPage.prototype.__showWait = function () {
        //console.log('wating...');
        $('.mask').css('display', 'flex');
    };
    
    //0. close waiting.                                                    ·
    AssessmentPage.prototype.__hideWait = function () {
        //console.log('hide wating...');
        $('.mask').hide();
    };
    
    //2. download items xml.
    AssessmentPage.prototype.__downloadItemsXml = function (callback) {
        var that = this;
        if(that.isItemsDownloaded){
            QtiLogger.info('Item Resource has initialized!');
            if (callback) {
                callback.apply(that, [true]);
            }
        }
        else{
            //prepare.
            var pageXmls = [];
            async.each(this.children, function(child, callback){
                var itemRef = child;
                pageXmls.push({ ItemID: itemRef.identifier, FileName: itemRef.href });
                var itemPath = [top.paperResource.PaperPath, top.paperResource.PaperCode, itemRef.identifier, top.paperResource.ItemTemplet].join('/');
                fs.exists(itemPath, function(flag){
                    if(flag){
                        QtiLogger.info('Item Resource :: ' + itemRef.identifier + 'existed!');
                        callback();
                    }
                    else{
                        var param = {
                            "item_id": itemRef.identifier + '.zip'
                        };
                        that.onUnZipFile([ajaxUrl, 'exam/downloadItem'].join('/'), param, 10000, [top.paperResource.PaperPath, top.paperResource.PaperCode].join('/') , [itemRef.identifier, 'zip'].join('.'), callback);
                    }
                });
            }, function(err){
                if(err){
                    if(callback){
                        callback.apply(that, [err.flag]);
                    }
                }
                else{
                    if (pageXmls.length > 0) {
                        //read
                        that.analysisOptions.onReadXmls(pageXmls, function (retObj) {

                            //将item读取出来的字符串保存起来
                            if (retObj.flag == true || retObj == 1) {
                                that.itemXmlHash.clear();
                                for (var i = 0, len = pageXmls.length; i < len; i++) {
                                    var pageXmlObj = pageXmls[i];
                                    that.itemXmlHash.add(pageXmlObj.ItemID, retObj.data[pageXmlObj.ItemID]);
                                }
                            }

                            if (callback) {
                                callback.apply(that, [retObj.flag]);
                            }
                        });
                    }
                    else {
                        //page中无试题
                        if (callback) {
                            callback.apply(that, [true]);
                        }
                    }
                }
            });
        }

    };



    //3. initialize the item's xml to itemRef.
    AssessmentPage.prototype.__initItemsXml = function (callback) {
        for (var i = 0, len = this.children.length; i < len; i++) {
            var itemRef = this.children[i];
            var itemXml = this.itemXmlHash.items(itemRef.identifier);
            itemRef.initItemXml(itemXml);
        }
        
        if (callback) {
            callback.apply(this, [true]);
        }
    };
    
    //4. download audios of items in this screen.
    AssessmentPage.prototype.__downloadItemsAudio = function (callback) {
        var that = this;
        //prepare
        var pageAudios = [];
        for (var i = 0, len = this.children.length; i < len; i++) {
            var itemRef = this.children[i];
            pageAudios = pageAudios.concat(itemRef.audios);
        }
        
        //download
        that.analysisOptions.onDownloadFiles(pageAudios, function (retObj) {
            if (callback) {
                callback.apply(that, [retObj.flag]);
            }
        });
    }; 

    //5.获取一页显示的小题答案列表信息
    AssessmentPage.prototype.__getAnswerHash = function (callback) {
        var that = this;
        var itemArray = [];
        for (var i = 0, len = this.children.length; i < len; i++) {
            var itemRef = this.children[i];
            itemArray.push(itemRef.identifier);
        }
        //读取所有答案信息
        if (itemArray.length > 0) {
            that.analysisOptions.onGetItemAnswers(itemArray, function (retObj) {
                if (retObj.flag == 1) {
                    if (retObj.data) {
                        //将所有答案信息存储起来
                        that.answersHash.clear();
                        for (var i = 0, len = that.children.length; i < len; i++) {
                            var responseIdList = that.children[i].getResponseIdList();
                            for (var j = 0, length = responseIdList.length; j < length ; j++) {
                                if (retObj.data[responseIdList[j]]) {
                                    that.answersHash.add(responseIdList[j], retObj.data[responseIdList[j]]);
                                }
                                else {
                                    that.answersHash.add(responseIdList[j], '');
                                }
                            }
                        }
                    }
                }
                if (callback) {
                    callback.apply(that, [retObj.flag == 1]);
                }
            });
        }
        else {
            if (callback) {
                callback.apply(that, [true]);
            }
        }
    };

    //答案一页一读,分析得到到单题的答案
    AssessmentPage.prototype.getItemAnswer = function (itemRef) {
        var responseIdList = itemRef.getResponseIdList();
        var itemRefHash = new Hashtable();
        for (var i = 0, len = responseIdList.length; i < len; i++) {
            var key = responseIdList[i];
            var answer = this.answersHash.items(key);
            itemRefHash.add(key, answer);
        }
        return itemRefHash;
    };

    //下载并解压小题
    AssessmentPage.prototype.onUnZipFile = function (url, params, timeout, filePath, fileName, callback) {
        var that = this;
        that.analysisOptions.onUnZipFile(url, params, timeout, filePath , fileName, function(retObj){
            if(retObj.flag){
                callback();
            }
            else{
                setTimeout(function(){
                    that.onUnZipFile(url, params, timeout, filePath, fileName, callback);
                }, 3000);
            }
        });
    };

    return AssessmentPage;

})(AbstractSegement);

//跳题规则
var BranchRule = (function () {

    function BranchRule() {

        //结果变量
        this.variable = null;

        //结果变量判定条件
        this.baseValue = null;

        //跳转的item Identifier
        this.target = null;
    }

    BranchRule.prototype.set = function (variable, baseValue, target) {
        this.variable = variable;
        this.baseValue = baseValue;
        this.target = target;
    };

    BranchRule.prototype.get = function () {
        return {
            variable: this.variable,
            baseValue: this.baseValue,
            target: this.target
        };
    };

    //退出常量
    BranchRule.exitOptions = {
        EXIT_SECTION: 'EXIT_SECTION', //退出当前section
        EXIT_TESTPART: 'EXIT_TESTPART', //退出当前testpart
        EXIT_TEST: 'EXIT_TEST'   //退出当前考试,直接退出考试
    };

    return BranchRule;
})();