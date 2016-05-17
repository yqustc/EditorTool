/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-11-3
 * Time: 上午09:23
 * Copyright @ www.iflytek.com
 */

var QtiValidator = (function () {

    function QtiValidator(options) {
        this.createOptions = $.extend({}, this.defaultOptions, options);
        this.init();
    }

    QtiValidator.prototype.init = function () {
        var that = this;
        window.checkLen = function () {
            that.checkLen.call(that, arguments);
        }
        window.checkMultiChoice = function () {
            that.checkMultiChoice.call(that, arguments);
        }

        //暂时先添加到top上面
        if (top) {
            top.checkLen = checkLen;
            top.checkMultiChoice = checkMultiChoice;
        }
    }

    //检查输入框内容长度是否合法
    //或做一些业务检查等
    QtiValidator.prototype.checkLen = function (x, y) {
        //todo:
        //this.createOptions.QTIEngine.computeProgress();
    }

    ///<summary>计算字符串长度</summary>
    QtiValidator.prototype.GetLength = function (str) {
        if (str) {
            str = removeAllSpace(str); //去除所有空格
            return str.length;
        } else {
            return 0;
        }
    };

    //除字符串前空格
    QtiValidator.prototype.trim = function (str) {
        return str.replace(/(^\s+)|(\s+$)/g, "");
    };

    //除字符串所空格
    QtiValidator.prototype.removeAllSpace = function (str) {
        return str.replace(/\s+/g, "");
    };

    //maxChoice数量,domName是checkbox的名称组
    QtiValidator.prototype.checkMultiChoice = function (arguments) {
        var maxChoices = arguments[0];
        var domName =arguments[1];
        var id = arguments[2];
        var $node = $(document).find('[name="' + domName + '"]');
        var val = [];
        if ($node.length > 0) {
            $node.each(function () {
                var isChecked = $(this).attr('checked');
                if (isChecked) {
                    val.push($(this).val());
                    return true;
                }
                return true;
            });
        }
        if (val.length > maxChoices) {
            var checkbox = document.getElementById(id);
            $(checkbox).removeAttr('checked');
        }
    };

    QtiValidator.defaultOptions = {
        QTIEngine: null
    };
    return new QtiValidator();
})();