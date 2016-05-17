/**
 * Created by qianyao on 2015/12/21.
 */


var itemType = {
    //选择题
    choice: 'choice',
    //填空题
    textEntry: 'textEntry'
};

var itemTypeXml = {
    //选择题
    choice: '<?xml version="1.0" encoding="UTF-8"?><assessmentItem identifier="choice" title="" adaptive="false" timeDependent="false"><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="identifier"></responseDeclaration><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"></outcomeDeclaration><itemBody><choiceInteraction orientation="{0}" responseIdentifier="RESPONSE" shuffle="false" maxChoices="{1}" ><sequence></sequence><prompt></prompt>{2}</choiceInteraction></itemBody><responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/></assessmentItem>',
    //填空题
    textEntry: '<?xml version="1.0" encoding="UTF-8"?><assessmentItem identifier="textEntry" title="" adaptive="false" timeDependent="false"><responseDeclaration identifier="RESPONSE" cardinality="single" baseType="string"></responseDeclaration><outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float"></outcomeDeclaration><itemBody><sequence></sequence><p>{0}<textEntryInteraction responseIdentifier="RESPONSE" expectedLength="15"/>{1}</p></itemBody><responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/></assessmentItem>'
};

var choiceType = {
    //单选题
    'single': 'single',
    //多选题
    'multiple': 'multiple'
};

var maxChoiceNum = {
    //单选题
    'single': 1,
    //多选题
    'multiple': 0
};

//QTI解析类型
var initializePattern = {
    //追加模式
    'addPattern': 0,
    //小题预览
    'itemDisplayPattern': 1,
    //考试模式
    'examPattern': 2,
    //编辑模式
    'editPattern': 3
};

//编辑方式
var editPattern = {
    //小题方式
    'itemPattern': 0,
    //试卷方式
    'paperPattern': 1
};

var paperResource = {
    //试卷完整路径
    PaperFullFolder: null,
    //试卷号
    PaperCode: null,
    //试卷路径
    PaperPath: './paper',
    //试卷包文件夹名称
    PaperFolder: 'paper',
    //试卷模板名称
    PaperTemplet: 'paper.xml',
    //小题模板名称
    ItemTemplet:'item.xml'
};

var require = window.top ? window.top.require : require;
var process = window.top ? window.top.process : process;
var jfs = require('jfs');
var fs = require('fs');
var gui = require('nw.gui');
var unzip = require('unzip');
var xml2js = require('xml2js');
var request = require('request');
var dirName = process.cwd();
var xmldom = require('xmldom');
var xpath = require('xpath');
var snd = require('SndUtil');
