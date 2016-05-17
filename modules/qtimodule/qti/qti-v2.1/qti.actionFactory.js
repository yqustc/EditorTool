/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-27
 * Time: 下午5:17
 * Copyright @ www.iflytek.com
 */

/**
 *action创建工厂
 */
var QtiActionFactory = (function () {

    /**
     * @param options is instanceof QtiActionFactory.defaultOptions
     * @constructor
     */
    function QtiActionFactory(options) {
        this.createOptions = $.extend({}, QtiActionFactory.defaultOptions, options);
    }

    /**
     * 创建test_start动作
     */
    QtiActionFactory.prototype.create_test_start_action = function (host) {

        var type = QtiActionFactory.actionTypes.test_start;
        var test_start_func = this.createOptions.testOptions.onstart;
        return this.__create_basic_action(type, host, test_start_func);
    };

    /**
     * 创建test_end动作
     */
    QtiActionFactory.prototype.create_test_end_action = function (host) {

        var type = QtiActionFactory.actionTypes.test_end;
        var test_end_func = this.createOptions.testOptions.onend;
        return this.__create_basic_action(type, host, test_end_func);
    };

    /**
     * 创建test_display动作
     */
    QtiActionFactory.prototype.create_test_display_action = function (host) {

        var type = QtiActionFactory.actionTypes.test_display;
        var test_display_func = this.createOptions.testOptions.ondisplay;
        return this.__create_basic_action(type, host, test_display_func);
    };

    /**
     * 创建testpart_start动作
     */
    QtiActionFactory.prototype.create_testpart_start_action = function (host) {

        var type = QtiActionFactory.actionTypes.testpart_start;
        var testpart_start_func = this.createOptions.testpartOptions.onstart;
        return this.__create_basic_action(type, host, testpart_start_func);
    };

    /**
     * 创建testpart_end动作
     */
    QtiActionFactory.prototype.create_testpart_end_action = function (host) {

        var type = QtiActionFactory.actionTypes.testpart_end;
        var testpart_end_func = this.createOptions.testpartOptions.onend;
        return this.__create_basic_action(type, host, testpart_end_func);
    };

    /**
     * 创建testpart_display动作
     */
    QtiActionFactory.prototype.create_testpart_display_action = function (host) {

        var type = QtiActionFactory.actionTypes.testpart_display;
        var testpart_display_func = this.createOptions.testpartOptions.ondisplay;
        return this.__create_basic_action(type, host, testpart_display_func);
    };

    /**
     * 创建section_start动作
     */
    QtiActionFactory.prototype.create_section_start_action = function (host) {

        var type = QtiActionFactory.actionTypes.section_start;
        var section_start_func = this.createOptions.sectionOptions.onstart;
        return this.__create_basic_action(type, host, section_start_func);
    };

    /**
     * 创建section_end动作
     */
    QtiActionFactory.prototype.create_section_end_action = function (host) {

        var type = QtiActionFactory.actionTypes.section_end;
        var section_end_func = this.createOptions.sectionOptions.onend;
        return this.__create_basic_action(type, host, section_end_func);
    };

    /**
     * 创建section_display动作
     */
    QtiActionFactory.prototype.create_section_display_action = function (host) {

        var type = QtiActionFactory.actionTypes.section_display;
        var section_display_func = this.createOptions.sectionOptions.ondisplay;
        return this.__create_basic_action(type, host, section_display_func);
    };

    /**
     * 创建item_start动作
     */
    QtiActionFactory.prototype.create_item_start_action = function (host) {

        var type = QtiActionFactory.actionTypes.item_start;
        var item_start_func = this.createOptions.itemOptions.onstart;
        return this.__create_basic_action(type, host, item_start_func);
    };

    /**
     * 创建item_end动作
     */
    QtiActionFactory.prototype.create_item_end_action = function (host) {

        var type = QtiActionFactory.actionTypes.item_end;
        var item_end_func = this.createOptions.itemOptions.onend;
        return this.__create_basic_action(type, host, item_end_func);
    };

    /**
     * 创建item_display动作
     */
    QtiActionFactory.prototype.create_item_display_action = function (host) {

        var type = QtiActionFactory.actionTypes.item_display;
        var item_display_func = this.createOptions.itemOptions.ondisplay;
        return this.__create_basic_action(type, host, item_display_func);
    };

    /**
     * 创建page_start动作
     */
    QtiActionFactory.prototype.create_page_start_action = function (host) {

        var type = QtiActionFactory.actionTypes.page_start;
        var page_start_func = this.createOptions.pageOptions.onstart;
        return this.__create_basic_action(type, host, page_start_func);
    };

    /**
     * 创建page_end动作
     */
    QtiActionFactory.prototype.create_page_end_action = function (host) {

        var type = QtiActionFactory.actionTypes.page_end;
        var page_end_func = this.createOptions.pageOptions.onend;
        return this.__create_basic_action(type, host, page_end_func);
    };

    /**
     * 创建page_display动作
     */
    QtiActionFactory.prototype.create_page_display_action = function (host) {

        var type = QtiActionFactory.actionTypes.page_display;
        var page_display_func = this.createOptions.pageOptions.ondisplay;
        return this.__create_basic_action(type, host, page_display_func);
    };

    /**
     * 创建page_prepare动作
     */
    QtiActionFactory.prototype.create_page_prepare_action = function (host) {

        var type = QtiActionFactory.actionTypes.page_prepare;
        var page_prepare_func = this.createOptions.pageOptions.onprepare;
        return this.__create_basic_action(type, host, page_prepare_func);
    };

    /**
     * 创建ext_rubricshow动作
     */
    QtiActionFactory.prototype.create_ext_rubricshow_action = function (host) {

        var type = QtiActionFactory.actionTypes.ext_rubricshow;
        var ext_rubricshow_func = this.createOptions.extOptions.onrubricshow;
        return this.__create_basic_action(type, host, ext_rubricshow_func);
    };

    /**
     * 创建ext_play动作
     * action.initArgs is typeof {audioFile:audioFile,audioType:audioType,audioTitle:audioTitle}
     */
    QtiActionFactory.prototype.create_ext_play_action = function (host) {

        var type = QtiActionFactory.actionTypes.ext_play;
        var ext_play_func = this.createOptions.extOptions.onplay;
        var ext_stopplay_func = this.createOptions.extOptions.onstopplay;
        return this.__create_basic_action(type, host, ext_play_func, null, ext_stopplay_func);
    };

    /**
     * 创建ext_record动作
     * action.initArgs is typeof {
            audioFile:audioFile,
            audioType:audioType,
            audioTitle:audioTitle,
            audioTime:audioTime,
            responseId:responseIdentifier
        }
     */
    QtiActionFactory.prototype.create_ext_record_action = function (host) {

        var type = QtiActionFactory.actionTypes.ext_record;
        var ext_record_func = this.createOptions.extOptions.onrecord;
        var ext_stoprecord_func = this.createOptions.extOptions.onstoprecord;
        return this.__create_basic_action(type, host, ext_record_func, null, ext_stoprecord_func);
    };

    /**
     * 创建ext_wait动作
     * action.initArgs is typeof {waitTime:audioTime,waitTitle:audioTitle}
     */
    QtiActionFactory.prototype.create_ext_wait_action = function (host) {

        var type = QtiActionFactory.actionTypes.ext_wait;
        var ext_wait_func = this.createOptions.extOptions.onwait;
        var ext_stopwait_func = this.createOptions.extOptions.onstopwait;
        return this.__create_basic_action(type, host, ext_wait_func, null, ext_stopwait_func);
    };

    /**
     * 创建基本动作
     * @param actionType
     * @param host 宿主对象
     * @param onExecuting 执行方法
     * @param onPausing 暂停方法
     * @param onStopping 停止方法
     * @private
     */
    QtiActionFactory.prototype.__create_basic_action = function (actionType, host, onExecuting, onPausing, onStoping) {

        if ((!host instanceof AbstractSegement)) {
            throw new Error('__create_basic_action: host is not the instance of AbstractSegement;actionType:' + actionType);
        }

        var caller = this.createOptions.QTIEngine;
        var on_executing = onExecuting ? function (action) {
            if (onExecuting) {
                onExecuting.apply(caller, arguments);
            }
        } : function (action, callback) {
            callback(this);
        };
        var on_pausing = onPausing ? function (action) {
            if (onPausing) {
                onPausing.apply(caller, arguments);
            }
        } : function (action, callback) {
            callback(this);
        };
        var on_stopping = onStoping ? function (action) {
            if (onStoping) {
                onStoping.apply(caller, arguments);
            }
        } : function (action, callback) {
            callback(this);
        };

        return new QtiAction({ actionType: actionType, host: host, onExecuting: on_executing, onPausing: on_pausing, onStoping: on_stopping });
    };

    /**
     * 默认动作类型
     */
    QtiActionFactory.actionTypes = {
        //test from:100
        test_start: 'test_start',
        test_display: 'test_display',
        test_end: 'test_end',

        //testpart from:200
        testpart_start: 'testpart_start',
        testpart_display: 'testpart_display',
        testpart_end: 'testpart_end',

        //section from:300
        section_start: 'section_start',
        section_display: 'section_display',
        section_end: 'section_end',

        //page from:400
        page_start: 'page_start',
        page_prepare: 'page_prepare',
        page_display: 'page_display',
        page_end: 'page_end',


        //item from:500
        item_start: 'item_start',
        item_display: 'item_display',
        item_end: 'item_end',

        //ext from:600
        ext_play: 'ext_play',
        ext_record: 'ext_record',
        ext_wait: 'ext_wait',
        ext_rubricshow: 'ext_rubricshow'
    };

    /**
     * 默认参数对象
     * @type {{}}
     */
    QtiActionFactory.defaultOptions = {
        QTIEngine: null,
        testOptions: {
            onstart: function (action) {
            },
            onend: function (action) {
            },
            ondisplay: function (action) {
            }
        },
        testpartOptions: {
            onstart: function (action, callback) {
            },
            onend: function (action, callback) {
            },
            ondisplay: function (action, callback) {
            }
        },
        sectionOptions: {
            onstart: function (action, callback) {
            },
            onend: function (action, callback) {
            },
            ondisplay: function (action, callback) {
            }
        },
        itemOptions: {
            onstart: function (action, callback) {
            },
            onend: function (action, callback) {
            },
            ondisplay: function (action, callback) {
            }
        },
        pageOptions: {
            onstart: function (action, callback) {
            },
            onend: function (action, callback) {
            },
            ondisplay: function (action, callback) {
            },
            onprepare: function (action, callback) { }
        },
        extOptions: {
            onrubricshow: function (action, callback) {
            },
            onplay: function (action, callback) {
            },
            onstopplay: function (action, callback) { },
            onrecord: function (action, callback) {
            },
            onstoprecord: function (action, callback) { },
            onwait: function (action, callback) {
            },
            onstopwait: function (action, callback) { }
        }
    };

    return QtiActionFactory;

})();