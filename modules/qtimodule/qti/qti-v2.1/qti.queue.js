/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-7-21
 * Time: 下午9:21
 * Copyright @ www.iflytek.com
 */


/**
 * 动作队列
 */
var ActionQueue = (function () {
    
    /**
     * key:动作的guid
     * value对应的动作
     */
    function ActionQueue() {
        this.__keys = [];
        this.__values = [];
    }
    
    /**
      * 提取动作的索引
      * 初始化动作队列
      */
    ActionQueue.prototype.initialize = function (actionArray) {
        this.__keys.clear();
        this.__values.clear();
        
        for (var i = 0, len = actionArray.length; i < len; i++) {
            var value = actionArray[i];
            var key = value.actionId;
            this.__keys.push(key);
            this.__values.push(value);
        }
    };
    
    /**
     * 在某个动作前插入一系列动作
     */
    ActionQueue.prototype.insertBefore = function (nextActionId, actionArray) {
        var keyIndex = this.__keys.indexOf(nextActionId);
        if (keyIndex >= 0) {
            var newKeys = [];
            for (var i = 0, len = actionArray.length; i < len; i++) {
                newKeys.push(actionArray[i].actionId);
            }
            this.__keys.insertArray(keyIndex, newKeys);
            this.__values.insertArray(keyIndex, actionArray);
        } else {
            throw new Error('insertBefore::actionQueue中未找到actionid=' + nextActionId + '的元素。');
        }
    };
    
    /**
    * 在某个动作后插入一系列动作
    */
    ActionQueue.prototype.insertAfter = function (prevActionId, actionArray) {
        var keyIndex = this.__keys.indexOf(prevActionId);
        if (keyIndex >= 0) {
            var newKeys = [];
            for (var i = 0, len = actionArray.length; i < len; i++) {
                newKeys.push(actionArray[i].actionId);
            }
            this.__keys.insertArray(keyIndex + 1, newKeys);
            this.__values.insertArray(keyIndex + 1, actionArray);
        } else {
            throw new Error('insertAfter::actionQueue中未找到actionid=' + prevActionId + '的元素。');
        }
    };
    
    /**
     * 获取指定的action
     * @param actionId
     * @returns {*}
     */
    ActionQueue.prototype.getAction = function (actionId) {
        if (actionId) {
            var keyIndex = this.__keys.indexOf(actionId);
            if (keyIndex >= 0) {
                return this.__values[keyIndex];
            }
        }
        //throw new Error('getAction::actionQueue中未找到actionid='+actionId+'的元素。');
        return null;
    };
    
    /**
      * 获取动作队列中的第一个动作ActionId
      */
    ActionQueue.prototype.getFirstActionId = function () {
        if (this.__keys.length == 0) {
            //throw new Error('getFirstActionId::actionQueue中没有元素');
            return null;
        }
        return this.__keys[0];
    };
    
    /**
      * 根据当前的动作Id,找到当前动作的下一个动作
      */
    ActionQueue.prototype.getNextActionId = function (curActionId) {
        var keyIndex = this.__keys.indexOf(curActionId);
        keyIndex = keyIndex + 1;
        if (keyIndex >= 0 && keyIndex < this.__keys.length) {
            return this.__keys[keyIndex];
        }
        
        //throw new Error('getNextActionId::actionQueue中未找到actionid='+curActionId+'的元素。');
        return null;
    };

    /**
     * 根据当前的动作Id,找到当前动作的下一个动作
     */
    ActionQueue.prototype.getNextAction = function (curActionId) {
        var keyIndex = this.__keys.indexOf(curActionId);
        keyIndex = keyIndex + 1;
        if (keyIndex >= 0 && keyIndex < this.__keys.length) {
            return this.__values[keyIndex];
        }

        //throw new Error('getNextActionId::actionQueue中未找到actionid='+curActionId+'的元素。');
        return null;
    };
    
    /**
      * 根据当前的动作Id,找到当前动作的上一个动作
      */
    ActionQueue.prototype.getPrevActionId = function (curActionId) {
        var keyIndex = this.__keys.indexOf(curActionId);
        keyIndex = keyIndex - 1;
        if (keyIndex >= 0 && keyIndex < this.__keys.length) {
            return this.__keys[keyIndex];
        }
        
        //throw new Error('getNextActionId::actionQueue中未找到actionid='+curActionId+'的元素。');
        return null;
    };

    /**
     *根据当前的action，找到下一个actiontype类型的acion
     * @param curActionId
     * @param actiontype
     */
    ActionQueue.prototype.getPrevActionByType=function(curActionId,actiontype){
        var keyIndex = this.__keys.indexOf(curActionId);
        for(var i=keyIndex- 1; i>=0;i--){
            if(this.__values[i].actionType==actiontype){
                return this.__values[i].actionId;
            }
        }

        return null;
    };

    /**
     *根据当前的action，找到下一个actiontype类型的acion
     * @param curActionId
     * @param actiontype
     */
    ActionQueue.prototype.getNextActionByType=function(curActionId,actiontype){
        var keyIndex = this.__keys.indexOf(curActionId);
        for(var i=keyIndex+ 1,len=this.__values.length;i<len;i++){
            if(this.__values[i].actionType==actiontype){
                return this.__values[i].actionId;
            }
        }

        return null;
    };
    
    /**
    * 根据小题的Item标示符找该小题相关的action
    */
    ActionQueue.prototype.getActionIdByIdentifier = function (itemIdentifier, actionType) {
        for (var i = 0, len = this.__keys.length; i < len; i++) {
            var action = this.__values[i];
            if (action.actionType == actionType && actionType == QtiActionFactory.actionTypes.page_start) {
                for (var j = 0, lenj = action.host.children.length; j < lenj; j++) {
                    var child = action.host.children[j];
                    if (child && child.identifier == itemIdentifier) {
                        return action.actionId;
                    }
                }
            }
            else if (action.actionType == actionType &&
                (actionType == QtiActionFactory.actionTypes.item_start ||
                    actionType == QtiActionFactory.actionTypes.section_start)) {
                if (action.host.identifier == itemIdentifier) {
                    return action.actionId;
                }
            }
        }
        return null;
    };
    
    /**
    * 根据小题的Item标示符找该小题相关的EndAction
    */
    ActionQueue.prototype.getActionByIdentifier = function (identifier, actionType) {
        for (var i = 0, len = this.__keys.length; i < len; i++) {
            var action = this.__values[i];
            if (action.actionType == actionType && actionType == QtiActionFactory.actionTypes.item_end) {
                if (action.host.identifier == identifier) {
                    return action;
                }
            }
        }
        return null;
    };
    
    /**
    * 根据page标示符找小题动作
    * identifier 是当前页的标示符
    * 返回当前页的所有小题的EndAction
    */
    ActionQueue.prototype.getActionsByPageIdentifier = function (identifier, actionType) {
        var actions = [];
        for (var i = 0, len = this.__keys.length; i < len; i++) {
            var action = this.__values[i];
            if (action.identifier == identifier && action.actionType == QtiActionFactory.actionTypes.page_start) {
                //首先定位到page action.actionType == EnumActionType.AssessmentItemRef_End
                for (var j = 0, lenj = action.host.children.length; j < lenj; j++) {
                    var child = action.host.children[j];
                    if (child) {
                        for (var k = 0, lenk = child.actions.length; k < lenk; k++) {
                            var action = child.actions[k];
                            if (action && action.actionType == QtiActionFactory.actionTypes.item_end
                                && actionType == QtiActionFactory.actionTypes.item_end) {
                                actions.push(action);
                            }
                        }
                    }
                }
            }
        }
        return actions;
    };
    
    /**
     * 将指定page内的displayaction前置
     * @param pageAction
     */
    ActionQueue.prototype.sortActionsInPage = function (pageAction) {
        var newPageActions = [];
        var newPageKeys = [];
        var pageDisplayActions = [];
        var pageDisplayKeys = [];
        var curIndex = this.__values.indexOf(pageAction);
        for (var i = curIndex + 1; i < this.__values.length; i++) {
            var curAction = this.__values[i];
            var flag = curAction.actionType == QtiActionFactory.actionTypes.page_display ||
                curAction.actionType == QtiActionFactory.actionTypes.test_display ||
                curAction.actionType == QtiActionFactory.actionTypes.testpart_display ||
                curAction.actionType == QtiActionFactory.actionTypes.section_display ||
                curAction.actionType == QtiActionFactory.actionTypes.item_display;
            if (curAction.actionType == QtiActionFactory.actionTypes.page_start) {
                break;
            }
            else if (!flag) {
                newPageActions.push(curAction);
                newPageKeys.push(curAction.actionId);
            } else {
                pageDisplayActions.push(curAction);
                pageDisplayKeys.push(curAction.actionId);
            }
        }
        
        if (newPageActions.length > 0) {
            var newActions = pageDisplayActions.concat(newPageActions);
            var newKeys = pageDisplayKeys.concat(newPageKeys);
            this.__values.splice(curIndex + 1, newKeys.length);
            this.__values.insertArray(curIndex + 1, newActions);
            this.__keys.splice(curIndex + 1, newKeys.length);
            this.__keys.insertArray(curIndex + 1, newKeys);
        }
    };
    
    /**
      * 动作队列清空
      */
    ActionQueue.prototype.clear = function () {
        this.__keys.clear();
        this.__values.clear();
    };

    /**
     *打印队列顺序
     */
    ActionQueue.prototype.printActions=function(){
        var action_types = [];
        for(var i= 0,len=this.__values.length;i<len;i++){
            action_types.push(this.__values[i].actionType);
        }
        return action_types;
    };

    return ActionQueue;
})();