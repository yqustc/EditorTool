/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-11-1
 * Time: 下午5:13
 * Copyright @ www.iflytek.com
 */

var QtiLogger = (function () {
    
    function QtiLogger() {
        this.level = QtiLogger.logLevels.debug;
    }
    
    //设置等级
    QtiLogger.prototype.setLevel = function (level) {
        this.level = level;
    };

    //如:2009-06-12 12:00:05
    QtiLogger.prototype.currentTime = function () {
        var now = new Date();
        var year = now.getFullYear();       //年
        var month = now.getMonth() + 1;     //月
        var day = now.getDate();            //日

        var hh = now.getHours();            //时
        var mm = now.getMinutes();          //分
        var sec = now.getSeconds();   //秒
        var misec=now.getMilliseconds();

        var clock = year + "-";

        if (month < 10)
            clock += "0";

        clock += month + "-";

        if (day < 10)
            clock += "0";

        clock += day + " ";

        if (hh < 10)
            clock += "0";

        clock += hh + ":";
        if (mm < 10) clock += '0';
        clock += mm + ":";
        if (sec < 10) {
            clock += '0';
        }
        clock += sec + ":";
        if (10 < misec && misec < 100) {
            clock += '0';
        }
        if (misec < 10) {
            misec += '00';
        }
        clock += misec;
        return (clock);
    };
    
    //debug
    QtiLogger.prototype.debug = function (format, args) {
        if (this.level <= QtiLogger.logLevels.debug) {
            var message = String.format.apply(this, arguments);
            console.log(this.currentTime() + "::" + '【DEBUG】 :: ' + message);
        }
    };
    
    //info
    QtiLogger.prototype.info = function (format, args) {
        if (this.level <= QtiLogger.logLevels.INFO) {
            var message = String.format.apply(this, arguments);
            console.log(this.currentTime() + "::" + '【 INFO】 :: ' + message);
        }
    };
    
    //warn
    QtiLogger.prototype.warn = function (format, args) {
        if (this.level <= QtiLogger.logLevels.WARN) {
            var message = String.format.apply(this, arguments);
            console.log(this.currentTime() + "::" + '【 WARN】 :: ' + message);
        }
    };
    
    //error
    QtiLogger.prototype.error = function (format, args) {
        if (this.level <= QtiLogger.logLevels.ERROR) {
            var message = String.format.apply(this, arguments);
            console.log(this.currentTime() + "::" + '【ERROR】 :: ' + message);
        }
    };
    
    //other
    QtiLogger.prototype.other = function (format, args) {
        if (this.level <= QtiLogger.logLevels.OTHER) {
            var message = String.format.apply(this, arguments);
            console.log(this.currentTime() + "::" + '【OTHER】 :: ' + message);
        }
    };
    
    QtiLogger.logLevels = {
        debug: 0,
        INFO: 2,
        WARN: 4,
        ERROR: 6,
        OTHER: 8
    };
    
    return new QtiLogger();
})();