/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-27
 * Time: 下午3:37
 * Copyright @ www.iflytek.com
 */

var QtiAction = (function () {
    
    /**
     * set the actiontype
     * @constructor
     * @param createOptions :   QtiAction.defaultOptions
     */
    function QtiAction(createOptions) {
        this.initArgs = null;
        this.actionId = Guid.create();
        this.createOptions = $.extend({}, QtiAction.defaultOptions, createOptions);
        this.host = this.createOptions.host;
        this.actionType = this.createOptions.actionType;
    }
    
    /**
     * set the init-args.
     */
    QtiAction.prototype.init = function (initArgs) {
        this.initArgs = initArgs;
    };
    
    /**
     * start
     * @param callback
     */
    QtiAction.prototype.start = function (callback) {
        var that = this;
        var func = this.createOptions.onExecuting;
        if (!func && callback) {
            callback(that);
            return;
        }
        
        func(that, function () {
            if (callback) {
                callback(that, true);
            }
        });
    };    
    
    /**
     * pause
     * @param callback
     */
    QtiAction.prototype.pause = function (callback) {
        var that = this;
        var func = this.createOptions.onPausing;
        if (!func && callback) {
            callback(that);
            return;
        }
        
        func(that, function () {
            if (callback) {
                callback(that, true);
            }
        });
    };
    
    /**
     * stop
     * @param callback
     */
    QtiAction.prototype.stop = function (callback) {
        var that = this;
        var func = this.createOptions.onStoping;
        if (!func && callback) {
            callback(that);
            return;
        }
        
        func(that, function () {
            if (callback) {
                callback(that, true);
            }
        });
    };
    
    /**
     * 默认参数
     * @type {{}}
     */
    QtiAction.defaultOptions = {
        //动作类型
        actionType: '',
        //宿主对象
        host: null,
        //执行方法
        onExecuting: function (action, callback) {
        },
        //暂停方法
        onPausing: function (action, callback) {
        },
        //停止方法
        onStoping: function (action, callback) {
        }
    };
    
    /**
     *媒体类型枚举
     * @type {{}}
     */
    QtiAction.mediaActions = {
        //播放
        play: 'play',
        //录音
        record: 'record',
        //等待
        wait: 'wait'
    };
    
    return QtiAction;

})();