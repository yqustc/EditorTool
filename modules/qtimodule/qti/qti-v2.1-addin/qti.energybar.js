(function($) {
	String.prototype.format = function () {
        var s = this;
        var i = arguments.length;
        while (i-- >= 0) {
            s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
        }
        return s;
    };
	var uniqueid = 0;
	var default_options = {
		timetick:50,
		value:0,
		minvalue:0,
		maxvalue:10,
		change:0.05,
		width:200,
		height:20,
		background:'border:1px solid #aaaaaa;border-radius:8px;',
		foreground:'border-radius:8px;background-color:#25B4E3;',
		labelstyle:'text-align:center;',		
		onfinish:function () {},
		ontick:function () {},
		onrender:function () {}
	}
	var progressbar = function (options) {
		this.options = options;
		this.id = uniqueid++;
	}
	progressbar.prototype = {
		init:function () {
			var opts = this.options;
			var show = [];
			show.push('<div id="myprgbar_progressbar_{0}" style="position:relative;'.format(this.id));
			show.push('width:{0}px;height:{1}px;{2}">'.format(opts.width,opts.height,opts.background));
			show.push('<div id="myprgbar_value_{0}" style="text-align:center;position:absolute;height:{1}px;line-height:{1}px;text-align:center;{2}"></div>'.format(this.id,opts.height,opts.foreground));
			show.push('<div id="myprgbar_label_{0}" style="position:absolute;width:{1}px;line-height:{2}px;{3}"></div>'.format(this.id,opts.width,opts.height,opts.labelstyle));
			show.push('</div>');
			if(opts.target){
				opts.target.append(show.join(''));
			}
		},
		progressbar:function () {
			return $('#myprgbar_progressbar_{0}'.format(this.id));	
		},
		progressvalue:function () {
			return $('#myprgbar_value_{0}'.format(this.id));
		},
		progresslabel:function () {
			return $('#myprgbar_label_{0}'.format(this.id));
		},
		showlabel:function (label) {
			this.progresslabel().text(label);
		},
		percent:function () {
			var opts = this.options;
			var range = opts.maxvalue - opts.minvalue;
			return (opts.value * 100 / range).toFixed(2) + '%';
		},
		_tick:function () {
			var opts = this.options;
			opts.value += opts.change;
			if(opts.change > 0 && opts.value >= opts.maxvalue)
			{
				opts.value = opts.maxvalue;
			}	
			if(opts.change < 0 && opts.value <= opts.minvalue)
			{
				opts.value = opts.minvalue;
			}
			opts.ontick && opts.ontick(this);
		},		
		_render:function () {
			var opts = this.options;
			var target = opts.target;
			var width = this.progressbar().width();			
			var range = opts.maxvalue - opts.minvalue;
			var cur = opts.value * width / range;
			this.progressvalue().width(cur);
			opts.onrender && opts.onrender(this);			
		},
		_check:function () {
			var opts = this.options;
			opts.change = opts.change || opts.maxvalue - opts.value;
			opts.timetick = opts.timetick || 1000;
			if(opts.value > opts.maxvalue)
			{
				opts.value = opts.maxvalue;
			}
			if(opts.value < opts.minvalue)
			{
				opts.value = opts.minvalue;
			}
			if(opts.change > 0 && opts.value >= opts.maxvalue)
			{
				opts.onfinish && opts.onfinish(this);
				this.pause();
			}	
			if(opts.change < 0 && opts.value <= opts.minvalue)
			{
				opts.onfinish && opts.onfinish(this);
				this.pause();
			}
		},
		render:function () {
			this._check();
			this._render();			
		},
		start:function () {
			this.show();
			var that = this;
			if(this.t){return;}
			this.t = setInterval(function() {
				that._check();
				that._tick();
				that._render();				
			}, this.options.timetick);
		},
		pause:function () {
			clearInterval(this.t);
			this.t = null;
		},
		stop:function () {
			this.hide();
			clearInterval(this.t);
			this.t = null;	
		},
		show:function () {
			this.progressbar().show();
		},
		hide:function () {
			this.progressbar().hide();
		}
	};
	$.fn.mybar = function (options) {		
		var _this = this.eq(0);
		var old = _this.data('mybar');
		if(old){
			if(options){
				$.extend(old.options, options);
				old.render();				
			}
			return old;
		};
		var opts = $.extend({}, default_options,options);
		opts.target = _this;
		var b = new progressbar(opts);	
		b.init();
		b.render();
		_this.data('mybar',b);
		return b;
	}
})(jQuery);