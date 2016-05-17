$(function ($) {

    function init(target, options) {
        var widgetHtml = [
            '<div class="progress">' +
                '<div class="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">' +
                '</div>' +
            '</div>'
        ];
        var widget = $(widgetHtml).appendTo(target);
        $(target).find('.progress-bar').addClass(options.addClass);
        $(target).find('.progress-bar').css('min-width', options.minWidth);
        return widget;
    };

    function setMaxValue(target, maxValue) {

        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;
        opts.maxValue = maxValue;
        $.data(this, 'QtiProgressBar', {
            options: opts,
            QtiProgressBar: widget
        });
    };

    function setProgressValue(target, value) {

        value = parseInt(value);

        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;
        var titleFormat = opts.titleFormat;
        var maxValue = opts.maxValue;
        var countDown = Math.ceil((maxValue - value) / 1000);
        var widthValue = value * 100 / maxValue;

        var title = titleFormat.replace('{countdown}', countDown).replace('{percent}', value + '%');
        $(target).find('.progress-bar').attr('aria-valuenow', widthValue);
        $(target).find('.progress-bar').css('width', widthValue + '%');
        $(target).find('.progress-bar').html(title);
        if (value >= 100 && opts.events.onComplete) {
            opts.events.onComplete.apply(this, []);
        }
    };

    function waitTime(target, time, startCallback, endCallback) {
        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;

        var titleFormat = opts.titleFormat;
        var countDown = Math.ceil((time - 0) / 1000);
        var title = titleFormat.replace('{countdown}', countDown).replace('{percent}', 0 + '%');
        $(target).find('.progress-bar').html(title);

        setMaxValue(target, time);
        var intervalMillSecs = 1000;
        var interval = opts.interval;
        opts.curTime = 0;
        opts.leftTime = time;
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(function () {
            opts.curTime += intervalMillSecs;
            opts.leftTime = time - opts.curTime;
            setProgressValue(target, opts.curTime);
            $.data(this, 'QtiProgressBar', {
                options: opts,
                QtiProgressBar: widget
            });
            if (opts.curTime >= time) {
                clearWaittime(target, endCallback);
            }
        }, intervalMillSecs);

        //更新interval对象并且缓存起来
        opts.interval = interval;
        $.data(this, 'QtiProgressBar', {
            options: opts,
            QtiProgressBar: widget
        });

        if (startCallback) {
            startCallback.apply(this, []);
        }
    };

    function clearWaittime(target, callback) {
        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;
        var interval = opts.interval;
        if (interval) {
            clearInterval(interval);
            setProgressValue(target, 0);

            //更新
            opts.interval = null;
            $.data(this, 'QtiProgressBar', {
                options: opts,
                QtiProgressBar: widget
            });

            if (callback) {
                callback.apply(this, []);
            }
        }
    };

    function stopWaittime(target, callback) {
        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;
        var interval = opts.interval;
        if (interval) {
            clearInterval(interval);

            //更新
            opts.interval = null;
            $.data(this, 'QtiProgressBar', {
                options: opts,
                QtiProgressBar: widget
            });

            if (callback) {
                callback.apply(this, []);
            }
        }
    };

    function restartWaittime(target, startCallback, endCallback){
        var state = $.data(target, 'QtiProgressBar');
        var opts = state.options;
        var widget = state.QtiProgressBar;

        var titleFormat = opts.titleFormat;
        var countDown = Math.ceil((opts.leftTime - 0) / 1000);
        var title = titleFormat.replace('{countdown}', countDown).replace('{percent}', 0 + '%');
        $(target).find('.progress-bar').html(title);
        var intervalMillSecs = 1000;
        var interval = opts.interval;
        var totalTime = opts.curTime + opts.leftTime;
        if (interval) {
            clearInterval(interval);
        }
        interval = setInterval(function () {
            opts.curTime += intervalMillSecs;
            opts.leftTime -= intervalMillSecs;
            setProgressValue(target, opts.curTime);
            $.data(this, 'QtiProgressBar', {
                options: opts,
                QtiProgressBar: widget
            });
            if (opts.curTime >= totalTime) {
                clearWaittime(target, endCallback);
            }
        }, intervalMillSecs);

        //更新interval对象并且缓存起来
        opts.interval = interval;
        $.data(this, 'QtiProgressBar', {
            options: opts,
            QtiProgressBar: widget
        });

        if (startCallback) {
            startCallback.apply(this, []);
        }
    };

    $.fn.QtiProgressBar = function (options, param, param2, param3, param4, param5) {

        if (typeof options == 'string') {
            return $.fn.QtiProgressBar.methods[options](this, param, param2, param3, param4, param5);
        }

        options = options || {};
        return this.each(function () {
            var opts = $.data(this, 'QtiProgressBar');
            if (opts) {
                $.extend(opts.options, options);
            } else {
                var oop = $.extend({}, $.fn.QtiProgressBar.defaults, options);
                opts = $.data(this, 'QtiProgressBar', {
                    options: oop,
                    QtiProgressBar: init(this, oop)
                });
            }
        });
    };

    $.fn.QtiProgressBar.methods = {
        clear: function (jq) {
            jq.each(function (i) {
                setProgressValue(jq[i], 0);
            });
        },
        setMaxValue: function (jq, value) {
            jq.each(function (i) {
                setMaxValue(jq[i], value);
            });
        },
        setValue: function (jq, value) {
            jq.each(function (i) {
                setProgressValue(jq[i], value);
            });
        },
        //time 以秒为单位
        waittime: function (jq, time, startCallback, endCallback) {
            jq.each(function (i) {
                waitTime(jq[i], time * 1000, startCallback, endCallback);
            });
        },
        clearWaittime: function (jq, callback) {
            jq.each(function (i) {
                clearWaittime(jq[i], callback);
            });
        },
        stopWaittime: function (jq, callback) {
            jq.each(function (i) {
                stopWaittime(jq[i], callback);
            });
        },
        restartWaittime: function (jq, time, startCallback, endCallback) {
            jq.each(function (i) {
                restartWaittime(jq[i], time * 1000, startCallback, endCallback);
            });
        }
    };

    //{countdown}倒计时，以s为单位
    //{percent}百分比值
    $.fn.QtiProgressBar.defaults = {
        events: {
            onComplete: null
        },
        interval: null,
        addClass: null,
        minWidth: '2em',
        maxValue: 100,
        leftTime: 0,
        curTime: 0,
        titleFormat: '剩余{countdown}s'
    }

}(jQuery));