var IndexService = {
    //初始化计时器
    InitClock: function(time){
        clock && clock.stop();
        clock = $.clock({ begin: ~~time || 0, inc: 1 , interval: 100});
        clock.events.onrender = function (result, sec) {
        };
        clock.start();
    },

    //停止流程
    stop: function (callback) {
        if (inst) {
            console.log("外部页面调用Stop，停止流程！");
            inst.stop(function () {
                if (callback) {
                    callback.apply(this);
                }
            });
        }
    },

    //停止录放音
    stopMedia: function(){
        if(inst){
            console.info("停止录放音！");
            inst.createOptions.QtiMedia.stop();
            $('.oralInteraction .progressBar').QtiProgressBar('stopWaittime', function(){});//进度条停止
        }
    },
    //统一异常处理
    exceptionHandler: function (msg) {
        //异常处理
        console.info("exceptionHandler:" + msg);
        clock && clock.stop();
    },

    showVolume: function(volume){
        $('.oralInteraction .energyBar').mybar({
            maxvalue: 100,
            minvalue: 0,
            height: 32,
            width: 109,
            value: volume,
            background: 'background:url(content/images/voice_bg.png) no-repeat',
            foreground: 'background:url(content/images/voice_up.png) no-repeat',
            onrender: function (t) {
                //t.showlabel(t.options.value.toFixed(0));
            }
        }).render();
    },

    deviceError: function(){
        this.stop();
        this.stopMedia();
    },

    //QTI解析类型
    initializePattern: {
        //追加模式
        'addPattern': 0,
        //小题预览
        'itemDisplayPattern': 1,
        //考试模式
        'examPattern': 2,
        //编辑模式
        'editPattern': 3
    },

    //题型枚举值
    itemType: {
        //常规题
        'normal': 0,
        //文件题
        'file': 1
    }
};