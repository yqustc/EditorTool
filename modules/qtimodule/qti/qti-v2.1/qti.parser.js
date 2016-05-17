/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-7-17
 * Time: 下午12:44
 * Copyright @ www.iflytek.com
 */

/**
* 解析题型基类,提供默认实现
*/
var AbstractHtmlParser = (function ($) {
    
    function AbstractHtmlParser() { }
    
    AbstractHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        return this.getHtml(jqXmlNode);
    };
    
    AbstractHtmlParser.prototype.getHtml = function (jqXmlNode) {
        var cloneNode = jqXmlNode.clone();
        var $hide = $('#qti_xml_to_html');
        if ($hide.length == 0) {
            $hide = $('<div id="qti_xml_to_html"></div>').appendTo($('body'));
        }
        var $children = cloneNode.appendTo($hide.html(''));
        return $hide.html();
    };
    
    AbstractHtmlParser.prototype.getInnerHtml = function (jqXmlNode) {
        var $children = jqXmlNode.children();
        if ($children && $children.length > 0) {
            return this.getHtml($children);
        }
        return this.getHtml(jqXmlNode);
    };
    
    AbstractHtmlParser.prototype.getInnerText = function (jqXmlNode) {
        var cloneNode = jqXmlNode.clone();
        var $hide = $('#qti_xml_to_html');
        if ($hide.length == 0) {
            $hide = $('<div id="qti_xml_to_html"></div>').appendTo($('body'));
        }
        var $children = cloneNode.appendTo($hide.html(''));
        return $hide.text();
    };
    
    return AbstractHtmlParser;

})(jQuery);

/**
* RubricBlock标签解析类
*/
var RubricBlockHtmlParser = (function (_super) {
    
    extendClass(RubricBlockHtmlParser, _super);
    
    function RubricBlockHtmlParser() {
        _super.apply(this, arguments);
    }
    
    RubricBlockHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        var $rubricBlock = jqXmlNode.clone();
        var innerHtml = this.getHtml($rubricBlock);
        return '<div class="rubricBlock">' + innerHtml + '</div>'
    };
    
    return RubricBlockHtmlParser;

})(AbstractHtmlParser);

/**
* 选择题解析类
*/
var ChoiceHtmlParser = (function (_super) {
    
    extendClass(ChoiceHtmlParser, _super);
    
    function ChoiceHtmlParser() {
        _super.apply(this, arguments);
    }
    
    ChoiceHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        var maxChoices = jqXmlNode.attr('maxChoices'),
            resourceId = jqXmlNode.attr('responseIdentifier'),
            interactionId = [ownerId, '.', resourceId].join('');
        
        if (maxChoices && maxChoices != 1) {
            return this.__parseMultiple(interactionId, jqXmlNode);
        }
        
        return this.__parseSingle(interactionId, jqXmlNode);
    };
    
    /**
    * 单选题解析标签
    */
    ChoiceHtmlParser.prototype.__parseSingle = function (interactionId, jqXmlNode) {
        var that = this;
        var htmlArray = [];
        var shuffle = jqXmlNode.attr('shuffle') ? jqXmlNode.attr('shuffle') : false;
        var layout = jqXmlNode.attr('orientation');
        var allSimpleChoice = [];
        var length = 0;
        var choiceCode = 65;
        if (shuffle == 'true') {
            jqXmlNode.children().each(function () {
                var tagName = $(this)[0].tagName;
                if (tagName == 'simpleChoice') {
                    allSimpleChoice.push($(this));
                }
            });
        }

        var cloneNode = jqXmlNode.clone();
        //search mode
        cloneNode.find('prompt').each(function () {
            var promptHtml = ['<div class="prompt">', that.getInnerText($(this)), '</div>'].join('');
            $(this).replaceWith(promptHtml);
        });

        cloneNode.find('simpleChoice').each(function (i) {

            var choice = ChoiceHtmlParser.defaultOptions.choice;
            var choiceOptions = ChoiceHtmlParser.defaultOptions.choiceOptions;
            var length = cloneNode.length;
            var htmlArray = [];
            var choiceIdentify = $(this).attr('identifier');
            var forstr = interactionId + choiceOptions[i] + i;


            if (shuffle == 'true') {
                var choiceIndex = Math.floor(Math.random() * allSimpleChoice.length);
                var resultNode = allSimpleChoice[choiceIndex];
                var val = resultNode.attr('identifier');
                var choiceText = that.getInnerText(resultNode);

                var inputHtml = String.format('<input type="radio" name="{0}" id="{1}" value="{2}"/>', interactionId, forstr, val);
                var choiceOptHtml = '';
                if (choice && choice == true) {
                    choiceOptHtml = String.format('<span class="span">{0}、</span>', String.fromCharCode(choiceCode++));
                }
                var labelHtml = String.format('<label for="{0}">{1}<span class="choiceContent" data-identifier="{2}">{3}</span></label>', forstr, choiceOptHtml, choiceIdentify, choiceText);


                var choiceHtml = String.format('<div class="simpleChoice">{0}{1}</div>', inputHtml, labelHtml);
                htmlArray.push(choiceHtml);

                allSimpleChoice.splice(choiceIndex, 1);//删除已经使用的数据
                length++;

            }
            else {
                choiceText = that.getInnerText($(this));
                val = $(this).attr('identifier');
                inputHtml = String.format('<input type="radio" name="{0}" id="{1}" value="{2}"/>', interactionId, forstr, val);
                var choiceOptHtml = '';
                if (choice && choice == true) {
                    choiceOptHtml = String.format('<span class="span">{0}、</span>', String.fromCharCode(choiceCode++));
                }
                var labelHtml = String.format('<label for="{0}">{1}<span class="choiceContent" data-identifier="{2}">{3}</span></label>', forstr, choiceOptHtml, choiceIdentify, choiceText);


                var choiceHtml = String.format('<div class="simpleChoice">{0}{1}</div>', inputHtml, labelHtml);
                htmlArray.push(choiceHtml);

                length++;
            }


            $(this).replaceWith(htmlArray.join(''));

        });

        var toTag = jqXmlNode.attr('toTag');
        if (toTag) {
            return '<{0} class="choiceInteraction">{1} </{0}>'.format(toTag, new AbstractHtmlParser().getInnerHtml(cloneNode));
        }
        return '<div class="choiceInteraction ' + layout + '">' + new AbstractHtmlParser().getInnerHtml(cloneNode) + '</div>';
    };
    
    /**
     * 多选题解析标签
     */
    ChoiceHtmlParser.prototype.__parseMultiple = function (interactionId, jqXmlNode) {
        var that = this;
        var htmlArray = [];
        var shuffle = jqXmlNode.attr('shuffle') ? jqXmlNode.attr('shuffle') : false;
        var layout = jqXmlNode.attr('orientation');
        var allSimpleChoice = [];
        var length = 0;
        jqXmlNode.children().each(function () {
            var tagName = $(this)[0].tagName;
            if (tagName == 'simpleChoice') {
                allSimpleChoice.push($(this));
            }
        });


        var cloneNode = jqXmlNode.clone();
        //search mode
        cloneNode.find('prompt').each(function () {
            var promptHtml = ['<div class="prompt">', that.getInnerHtml($(this)), '</div>'].join('');
            $(this).replaceWith(promptHtml);
        });
        var maxChoices = Number(jqXmlNode.attr('maxChoices')) ? jqXmlNode.attr('maxChoices') : allSimpleChoice.length;
        cloneNode.find('simpleChoice').each(function (i) {

            var choice = ChoiceHtmlParser.defaultOptions.choice;
            var choiceOptions = ChoiceHtmlParser.defaultOptions.choiceOptions;
            var length = cloneNode.length;
            var htmlArray = [];
            var choiceIdentify = $(this).attr('identifier');
            var forstr = interactionId + choiceOptions[i] + i;

            if (shuffle == 'true') {
                var choiceIndex = Math.floor(Math.random() * allSimpleChoice.length);
                var resultNode = allSimpleChoice[choiceIndex];
                var val = resultNode.attr('identifier');
                var choiceText = that.getInnerText(resultNode);

                var inputHtml = String.format('<input type="checkbox" name="{0}" id="{1}" value="{2}" onchange="checkMultiChoice(\'' + maxChoices + '\'' + ',\'' + interactionId + '\'' + ',\'' + forstr + '\');"/>', interactionId, forstr, val);
                //var labelHtml = String.format('<label for="{0}">{1}</label>', forstr, choiceText);
                var labelHtml = String.format('<label for="{0}">{1}</label>', forstr, choiceText);
                var choiceOptHtml = '';
                if (choice && choice == true && choiceOptions) {
                    choiceOptHtml = String.format('<span class="span">{0}、</span>', choiceOptions[i]);
                }

                var choiceHtml = String.format('<div class="simpleChoice {0}">{1}{2}{3}</div>', layout, inputHtml, choiceOptHtml, labelHtml);
                htmlArray.push(choiceHtml);

                allSimpleChoice.splice(choiceIndex, 1);//删除已经使用的数据
                length++;

            }
            else {
                choiceText = that.getInnerHtml($(this));
                val = $(this).attr('identifier');
                inputHtml = String.format('<input type="checkbox" name="{0}" id="{1}" value="{2}" onchange="checkMultiChoice(\'' + maxChoices + '\'' + ',\'' + interactionId + '\'' + ',\'' + forstr + '\');"/>', interactionId, forstr, val);
                //labelHtml = String.format('<label for="{0}">{1}</label>',forstr,choiceText);
                labelHtml = String.format('<label for="{0}">{1}</label>', forstr, choiceText);
                choiceOptHtml = '';
                if (choice && choice == true && choiceOptions) {
                    choiceOptHtml = String.format('<span class="span">{0}、</span>', choiceOptions[i]);
                }

                choiceHtml = String.format('<div class="simpleChoice {0}">{1}{2}{3}</div>', layout, inputHtml, choiceOptHtml, labelHtml);
                htmlArray.push(choiceHtml);
                length++;
            }


            $(this).replaceWith(htmlArray.join(''));
        });

        var toTag = jqXmlNode.attr('toTag');
        if (toTag) {
            return '<{0} class="choiceInteraction">{1} </{0}>'.format(toTag, new AbstractHtmlParser().getInnerHtml(cloneNode));
        }
        return '<div class="choiceInteraction">' + new AbstractHtmlParser().getInnerHtml(cloneNode) + '</div>';
    };
    
    /**
     *默认配置项
     * @type {{choiceOptions: Array}}
     */
    ChoiceHtmlParser.defaultOptions = {
        choice: true,
        choiceOptions: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I','J','K','L','M','N','O','P','Q','R','S','T']
    };
    
    return ChoiceHtmlParser;

})(AbstractHtmlParser);

/**
 * textEntryInteraction标签解析类
 */
var TextHtmlParser = (function (_super) {
    
    extendClass(TextHtmlParser, _super);
    
    function TextHtmlParser() {
        _super.apply(this, arguments);
    }
    
    TextHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        //<input size="3" tabindex="1" maxlength="3" onkeyup="checkLen(this,this.value)">
        //return '<input type="text" id="' + ownerId + '_' + jqXmlNode.attr('responseIdentifier') +
        //    '" class="textEntryInteraction" name="' + ownerId + '.' + jqXmlNode.attr('responseIdentifier') +
        //    '" maxlength="' + jqXmlNode.attr('expectedLength') + '" onkeyup="checkLen(this,this.value)"  value=""  placeholder="请输入答案"/>';

        return '<input type="text" id="' + ownerId + '_' + jqXmlNode.attr('responseIdentifier') +
           '" class="textEntryInteraction" name="' + ownerId + '.' + jqXmlNode.attr('responseIdentifier') +
           '" onkeyup="checkLen(' + jqXmlNode.attr('expectedLength') + ',this.value)"  value=""  placeholder="请输入答案"/>';
    }
    
    return TextHtmlParser;

})(AbstractHtmlParser);

/**
 * extendedTextInteraction标签解析类
 */
var ExtendedTextHtmlParser = (function (_super) {
    
    extendClass(ExtendedTextHtmlParser, _super);
    
    function ExtendedTextHtmlParser() {
        _super.apply(this, arguments);
    }
    
    ExtendedTextHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        var id = ownerId + '_' + jqXmlNode.attr('responseIdentifier');
        var name = ownerId + '.' + jqXmlNode.attr('responseIdentifier');
        var maxlength = jqXmlNode.attr('expectedLength');
        var remainSpanId = "remain_" + id;
        var remainHtml = '<span id="' + remainSpanId + '" class="remainSpan"></span>';
        //return remainHtml + '<textarea  id="' + id + '" ' + 'rows="6"  class="extendedTextEntryInteraction" name="' + name +
        //     '" maxlength="' + jqXmlNode.attr('expectedLength') + '"  onkeyup="checkLen(this,this.value)"  oninput="checkLen(this,this.value)" value="" placeholder="请输入答案"></textarea>';
        return remainHtml + '<textarea  id="' + id + '" ' + 'rows="6"  class="extendedTextEntryInteraction" name="' + name +
              '"  onkeyup="checkLen(' + maxlength + ',this.value)" value="" placeholder="请输入答案"></textarea>';
    };
    
    return ExtendedTextHtmlParser;

})(AbstractHtmlParser);

/**
* oralInteraction题型解析类
*/
var OralHtmlParser = (function (_super) {
    
    extendClass(OralHtmlParser, _super);
    
    function OralHtmlParser() {
        _super.apply(this, arguments);
    }
    
    OralHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        var htmlArray = [];
        htmlArray.push('<div class="oralInteraction">');
        
        jqXmlNode.find('mediaBlock[action=record]').each(function () {
            var resId = $(this).attr('responseIdentifier');
            var file = $(this).attr('file');
            var temp = '<input type="hidden" name="' + ownerId + '.' + resId + '" id="' + ownerId + '_' + resId + '"  value="' + file + '" />';
            var tempDiv = '<div class="clue"></div><div class="progressBar"></div><div class="energyBar"></div>';
            htmlArray.push(temp);
            htmlArray.push(tempDiv);
        });
        
        htmlArray.push('</div>');
        return htmlArray.join('');
    };
    
    return OralHtmlParser;

})(AbstractHtmlParser);

/**
* MediaBlock标签解析类
*/
var MediaBlockHtmlParser = (function (_super) {
    
    extendClass(MediaBlockHtmlParser, _super);
    
    function MediaBlockHtmlParser() {
        _super.apply(this, arguments);
    }
    
    MediaBlockHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        return '<div class="mediaBlock">' + this.getInnerHtml(jqXmlNode) + '</div>';
    };
    
    return MediaBlockHtmlParser;

})(AbstractHtmlParser);


/**
* uploadInteraction标签解析类
*/
var UploadHtmlParser = (function (_super) {

    extendClass(UploadHtmlParser, _super);

    function UploadHtmlParser() {
        _super.apply(this, arguments);
    }

    UploadHtmlParser.prototype.parse = function (ownerId, jqXmlNode) {
        var that = this;
        var cloneNode = jqXmlNode.clone();
        //search mode
        cloneNode.find('prompt').each(function () {
            var promptHtml = ['<div class="prompt">', that.getInnerHtml($(this)), '</div>'].join('');
            $(this).replaceWith(promptHtml);
        });

        var buttonid = ownerId + '_' + jqXmlNode.attr('responseIdentifier') + '_button';
        var buttonname = ownerId + '.' + jqXmlNode.attr('responseIdentifier') + '_button';

        var deleteid=ownerId + '_' + jqXmlNode.attr('responseIdentifier') + '_a';

        var id = ownerId + '_' + jqXmlNode.attr('responseIdentifier');
        var name = ownerId + '.' + jqXmlNode.attr('responseIdentifier');

        var temp = '<div class="input-group">' +
            '<input type="text" class="form-control" id="' + id + '" name="' + name + '" placeholder="文件路径" readonly>' +
            '<span class="input-group-btn">' +
                '<button class="btn btn-primary" type="button" name="' + buttonname + '" id="' + buttonid + '" onclick="OpenDialog(\'' + id + '\',\'' + name + '\');">' +
                '<span class="glyphicon glyphicon-upload" aria-hidden="true"></span> 导入</button>' +
            '</span>' +
        '</div>';

        /*var temp = '<div class="uploadform"><input type="button" name="' + buttonname + '" id="' + buttonid +
            '" onclick="OpenDialog(\'' + id + '\');"  value="导入" />' + '<span id="' + id + '" name="' +
            name + '"></span><a id="' + deleteid + '"></a></div>';*/
        return '<div class="uploadInteraction">' + new AbstractHtmlParser().getInnerHtml(cloneNode) + temp + '</div>';

    };

    return UploadHtmlParser;

})(AbstractHtmlParser);

/**
 *统一解析类库
 */
var HtmlParserHelper = (function ($) {
    
    function HtmlParserHelper() {
        this.parsers = new Hashtable();
        this.parsers.add('choiceInteraction', new ChoiceHtmlParser());
        this.parsers.add('oralInteraction', new OralHtmlParser());
        this.parsers.add('mediaBlock', new MediaBlockHtmlParser());
        this.parsers.add('rubricBlock', new RubricBlockHtmlParser());
        this.parsers.add('textEntryInteraction', new TextHtmlParser());
        this.parsers.add('extendedTextInteraction', new ExtendedTextHtmlParser());
        this.parsers.add('uploadInteraction', new UploadHtmlParser());

        this.defaultParser = new AbstractHtmlParser();
    }
    
    HtmlParserHelper.prototype.parse = function (ownerId, jqXmlNode) {
        var that = this;
        var cloneNode = jqXmlNode.clone();
        that.__parseNode(ownerId, cloneNode);
        
        //search mode
        cloneNode.find('itemBody>mediaBlock').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
        
        cloneNode.find('textEntryInteraction').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
        
        cloneNode.find('extendedTextInteraction').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
        
        cloneNode.find('choiceInteraction').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
        
        cloneNode.find('oralInteraction').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
        
        cloneNode.find('uploadInteraction').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });

        cloneNode.find('rubricBlock').each(function () {
            $(this).replaceWith($(that.__parseNode(ownerId, $(this))));
        });
         
        cloneNode.find('itemBody>prompt').each(function () {
            var promptHtml = ['<div class="prompt">', new AbstractHtmlParser().getInnerHtml($(this)), '</div>'].join('');
            $(this).replaceWith(promptHtml);
        });
        return new AbstractHtmlParser().parse(ownerId, cloneNode);
    };
    
    HtmlParserHelper.prototype.__parseNode = function (ownerId, jqXmlNode) {
        var tagName = jqXmlNode[0].tagName;
        if (this.parsers.contains(tagName)) {
            var parser = this.parsers.items(tagName);
            var html = parser.parse(ownerId, jqXmlNode);
            return html;
        }
        return '';
    };
    
    return new HtmlParserHelper();

})(jQuery);