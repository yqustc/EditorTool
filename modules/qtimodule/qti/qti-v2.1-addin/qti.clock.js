/**
 * Created by qianyao on 2015/7/31.
 */
$(function () {
    //默认参数
    var default_clock_options = { inc: 1, format: '', begin: 0, interval: 1000 };

    /**
     * 计时器，参数格式new Clock({format:''})
     */
    var Clock = function (options) {
        options = $.extend({}, default_clock_options, options);
        this.seconds = options.begin;
        this.timer = null;
        this.inc = options.inc;
        this.format = options.format;
        this.interval = options.interval;
    }

    Clock.render = function (value, format) {
        value = value > 0 ? ~~value : 0;
        var second = value;
        var minute = 0;
        var hour = 0;
        var day = 0;
        if (format.indexOf('m') > -1 && second > 59) {
            minute = ~~(value / 60);
            second = ~~(value % 60);
        }
        if (format.indexOf('h') > -1 && minute > 59) {
            hour = ~~(minute / 60);
            minute = ~~(minute % 60);
        }
        if (format.indexOf('d') > -1 && hour > 23) {
            day = ~~(hour / 24);
            hour = ~~(hour % 24);
        }
        var o = {
            "d+": day,    //day
            "h+": hour,   //hour
            "m+": minute, //minute
            "s+": second
        };
        for (var k in o) {
            var re = new RegExp("(" + k + ")", "gm");
            if (re.test(format)) {
                format = format.replace(re,
                        RegExp.$1.length == 1 ? o[k] : (o[k]).toString().padLeft(RegExp.$1.length, '0'));
            }
        }
        return format;
    }

    Clock.prototype = {
        events: {
            ontick: null,
            onrender: null
        },
        start: function () {
            var that = this;
            that.tick();
            that.timer = setInterval(function(){
                that.tick();
            }, that.interval);
        },
        tick: function () {
            var that = this;
            that.seconds += that.inc;
            var ontick = that.events.ontick;
            ontick && ontick(that.seconds);
            var result;
            if (this.format) {
                result = Clock.render(that.seconds, that.format);
            }
            else {
                result = this.render();
            }
            var onrender = that.events.onrender;
            onrender && onrender(result, that.seconds);
            /*that.timer = setTimeout(function () {
                that.tick();
            }, that.interval);*/
        },
        render: function () {
            var that = this;
            var format = this.format;
            var value = Math.floor((~~this.seconds) / (1000/that.interval));
            value = value > 0 ? value : 0;
            var second = value;
            var minute = 0;
            var hour = 0;
            var day = 0;
            if (second > 59) {
                minute = ~~(value / 60);
                second = ~~(value % 60);
            }
            if (minute > 59) {
                hour = ~~(minute / 60);
                minute = ~~(minute % 60);
            }
            if (hour > 23) {
                day = ~~(hour / 24);
                hour = ~~(hour % 24);
            }
            return { day: day, hour: hour, minute: minute, second: second };
        },
        update: function (options) {
            if (!options) return;
            this.seconds = options.begin;
            this.inc = options.inc;
            this.format = options.format;
            this.interval = options.interval;
        },
        stop: function () {
            clearTimeout(this.timer);
        }
    };
    $.clock = function (options) {
        var c = new Clock(options);
        return c;
    }
});