/**
 * Created by qianyao on 2015/7/30.
 */

var inst;
var clock;
var ajaxUrl = 'http://';
var tosubmitAnswer = new Array();
var formattedAnswer = {};
var tosubmitFile = new Array();

var resJX = new QtiResourceJX({
    exceptionHandler: IndexService.exceptionHandler,
    storeData: new jfs("data"),
    xmlParser: new xml2js.Parser({trim: true}),
    xmlBuilder: new xml2js.Builder()
});


function QTIInitialize(pattern, param, container, callback){
    // 初始化QTI引擎
    var options = {
        showInOnePage: false,
        QtiResource: resJX
    };
    inst = new QtiEngineJX(options);
    inst.initialize(pattern, param, container, function (isSuccess) {
        if(isSuccess){
            inst.start(function(flag){
                if(flag){
                    //初始化计时器
                    callback && callback(inst.returncontent);
                }
            });
        }
    });
}
