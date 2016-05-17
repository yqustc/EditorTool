/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-7-17
 * Time: 下午12:44
 * Copyright @ www.iflytek.com
 */

/**
 *解析标签答案基类,提供默认的解析方法
 */
var DomResult = (function () {
    function DomResult() {
    }
    DomResult.prototype.getResult = function ($node) {
        return $node.val();
    };
    DomResult.prototype.setResult = function ($node, answer) {
        if (answer && answer != '')
            $node.val(answer);
    };
    return DomResult;
})();

/**
 *解析radioButton答案选项值
 */
var InputRadioResult = (function (_super) {
    extendClass(InputRadioResult, _super);
    function InputRadioResult() {
        _super.apply(this, arguments);
    }
    InputRadioResult.prototype.getResult = function ($node) {
        var val = undefined;
        $node.each(function () {
            var isChecked = $(this).attr('checked');
            if (isChecked) {
                val = $(this).val();
                return false;
            }
            return true;
        });
        return val;
    };
    
    InputRadioResult.prototype.setResult = function ($node, answer) {
        $node.each(function () {
            if ($(this).val() == answer) {
                $(this).attr('checked', 'checked');
                $(this).trigger('click');
            }
        });
    };
    
    return InputRadioResult;
})(DomResult);

/**
 *解析checkBox答案选项值
 */
var InputCheckboxResult = (function (_super) {
    extendClass(InputCheckboxResult, _super);
    function InputCheckboxResult() {
        _super.apply(this, arguments);
    }
    InputCheckboxResult.prototype.getResult = function ($node) {
        var val = [];
        $node.each(function () {
            var isChecked = $(this).attr('checked');
            if (isChecked) {
                val.push($(this).val());
                return true;
            }
            return true;
        });
        return val.join(',');
    };
    
    InputCheckboxResult.prototype.setResult = function ($node, answer) {
        
        if (answer && answer.split) {
            var answerArray = answer.split(',');
            $node.each(function () {
                
                for (var i = 0, len = answerArray.length; i < len; i++) {
                    if ($(this).val() == answerArray[i]) {
                        $(this).trigger('click');
                        $(this).attr('checked', 'checked');
                    }
                }
            });
        }
    };
    
    return InputCheckboxResult;
})(DomResult);



/**
 *答案统一解析类库
 */
var AnswerAnalyzerHelper = (function (domResult) {
    
    function AnswerAnalyzerHelper() {
        this.analyzers = new Hashtable();
        this.analyzers.add('input_radio', new InputRadioResult());
        this.analyzers.add('input_checkbox', new InputCheckboxResult());
        this.defaultAnalyzer = new DomResult();
    }
    
    AnswerAnalyzerHelper.prototype.setAnswers = function (nameAnswerMaps) {
        for (var i = 0, len = nameAnswerMaps.keys().length; i < len; i++) {
            var key = nameAnswerMaps.keys()[i];
            var answer = nameAnswerMaps.items(key);
            this.__setOneAnswer(key, answer);
        }
    };
    
    AnswerAnalyzerHelper.prototype.__setOneAnswer = function (domName, answer) {
        //先将下列div中值清空，否则搜索到的节点翻倍
        $('#qti_xml_to_html').html('');
        var $node = $(document).find('[name="' + domName + '"]');
        if ($node.length > 0) {
            var tagName = $node[0].tagName;
            var type = $node.attr('type');
            type = type ? type : '';
            var key = tagName + "_" + type;
            key = key.toLowerCase();
            
            var value;
            if (this.analyzers.contains(key)) {
                this.analyzers.items(key).setResult($node, answer);
            } else {
                this.defaultAnalyzer.setResult($node, answer);
            }
        }
    };
    
    /**
     *解析答案
     */
    AnswerAnalyzerHelper.prototype.analyze = function (domNames) {
        var results = new Hashtable();
        for (var i = 0, len = domNames.length; i < len; i++) {
            var r = this.__analyzeOne(domNames[i]);
            if (r) {
                results.add(r.key, r.value);
            }
        }
        return results;
    };
    
    AnswerAnalyzerHelper.prototype.__analyzeOne = function (domName) {
        var $node = $(document).find('[name="' + domName + '"]');
        if ($node.length > 0) {
            var tagName = $node[0].tagName;
            var type = $node.attr('type');
            type = type ? type : '';
            var key = tagName + "_" + type;
            key = key.toLowerCase();
            
            var value;
            if (this.analyzers.contains(key)) {
                value = this.analyzers.items(key).getResult($node);
                return { key: domName, value: value };
            } else {
                value = this.defaultAnalyzer.getResult($node);
                return { key: domName, value: value };
            }
        } else {
            return null;
        }
    };
    
    return new AnswerAnalyzerHelper();

})(DomResult);