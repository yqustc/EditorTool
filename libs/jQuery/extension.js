/**
 * 字符串格式化方法
 * @param arguments[0] 格式化字符串,arguments[1...n] 参数
 * @returns {*}
 */
String.format = function () {
    if (arguments.length == 0)
        return null;
    var str = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var re = new RegExp('\\{' + (i - 1) + '\\}', 'gm');
        str = str.replace(re, arguments[i]);
    }
    return str;
};

/**
 * 利用占位符格式化字符串
 * 例如："你好，{0}, {1}".format('bintang', 'Nice to meet you!') = "你好，bintang, Nice to meet you!";
 */
String.prototype.format = function () {
    var s = this, i = arguments.length;

    while (i-- >= 0) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

/**
 * 时间字符串格式化
 */
String.prototype.lastIndexOfMulti = function () {
    if (arguments == null || arguments.length <= 0)
        return -1;

    var that = this;
    var indexArray = [];
    for (var argsIndex = 0; argsIndex < arguments.length; argsIndex++) {
        indexArray.push(that.lastIndexOf(arguments[argsIndex]));
    }

    return indexArray.max();
};


/**
 * 时间字符串格式化
 */
String.prototype.formatDate = function (formatter) {
    var that = this.replace('-', '/');
    var date = new Date(that);
    return date.toFormatString(formatter);
};

/*
*去除字符串中的空格
*/
String.prototype.trim = function () {
    var s = this;
    return s.replace(/\s+/g, "");
}

/** 返回相同位数的数字字符串，比如01,001等
 *@param {int} fatherNum 总数
 *@param {int} num 当前数字
 *@return {string} 返回与总数相同位数的数字字符串
 */
String.num_show = function (fatherNum, num) {
    var father_len = fatherNum.toString().length;
    var num_len = num.toString().length;
    if (father_len == num_len) {
        return num.toString();
    } else if (father_len > num_len) {
        var count = father_len - num_len;
        var str = '';
        for (var i = 0; i < count; i++) {
            str += "0";
        }
        return str + num.toString();
    }
};


/**
 * 字符串转对象
 */
String.prototype.toObject = function () {
    var evalObject = undefined;
    try {
        var firstLetter = this.charAt(0);
        if (firstLetter == "[") {
            evalObject = eval('(' + this + ')');
        } else if (firstLetter == "{") {
            evalObject = eval('(' + this + ')');
        } else {
            evalObject = eval('[' + this + ']');
        }
    } catch (e) {
        log(e.toString());
        //alert(e.toString());
        return this;
    }

    return evalObject;
};


/**
 *截获指定长度的字符串，多出的部分有...显示
 */
String.prototype.cutShot = function (maxLength) {
    var str = this;
    str = str.toString();
    if (str == null || str == "")
        return;
    var nameAvgTotalLength = str.replace(/[^\x00-\xff]/g, "**").length;
    maxLength = nameAvgTotalLength - maxLength + 3;
    if (maxLength > 0) {
        if (nameAvgTotalLength > maxLength) {
            var newstr = "";
            var newStrBackName = "";
            var nameLength = str.length;
            var totalLength = 0;
            var avgLength = nameAvgTotalLength - maxLength;
            nameAvgTotalLength -= avgLength;
            var strList = str.split("");
            for (var i = 0; i < nameLength; i++) {
                var cName = strList[i];
                if (/^[\u4e00-\u9fa5]$/.test(cName)) {
                    totalLength += 2;
                }
                else {
                    totalLength += 1;
                }
                if (totalLength <= avgLength || totalLength > nameAvgTotalLength) {
                    if (totalLength <= avgLength)
                        newstr += cName;
                    else
                        newStrBackName += cName;
                }
            }
            str = newstr + "...";
        }
    }
    return str;
}

/**
 * 数据的补充
 * @param b
 * @param c
 * @returns {*}
 */
String.prototype.padLeft = function (total, padChar) {
    var d = this;
    while (d.length < total) {
        d = padChar + d;
    }
    return d;
}

String.prototype.endWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substring(this.length - s.length) == s)
        return true;
    else
        return false;
    return true;
};

String.prototype.startWith = function (s) {
    if (s == null || s == "" || this.length == 0 || s.length > this.length)
        return false;
    if (this.substr(0, s.length) == s)
        return true;
    else
        return false;
    return true;
};

String.prototype.leftTrim = function () {
    if (this.length == 0)
        return '';

    return this.replace(/(^\s*)/g, "");
};

/**
 *替换字符串中指定位置的指定长度的字符串替换为新字符串
 * @param start
 * @param length
 * @param replaceString
 */
String.prototype.replaceWith = function (start, length, replaceString) {

    var cutStr = this.substr(start, length);

    var prefixStr = '', afterStr = '';
    if (start > 0) {
        prefixStr = this.substring(0, start);
    }
    if (start + length < this.length) {
        afterStr = this.substring(start + length, this.length);
    }

    return [prefixStr, replaceString, afterStr].join('');

};

/**
 * 去除数组中的重复数据
 * */
Array.prototype.del = function () {
    var a = {},
        c = [],
        l = this.length;
    for (var i = 0; i < l; i++) {
        var b = this[i];
        var d = (typeof b) + b;
        if (a[d] === undefined) {
            c.push(b);
            a[d] = 1;
        }
    }
    return c;
};

Array.prototype.max = function () {
    var max = this[0];
    var len = this.length;
    for (var i = 1; i < len; i++) {
        if (this[i] > max) {
            max = this[i];
        }
    }
    return max;
};

Array.prototype.indexOf = function (val) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == val) return i;
    }
    return -1;
};

Array.prototype.remove = function (val) {
    var index = this.indexOf(val);
    if (index > -1) {
        this.splice(index, 1);
    }
};

Array.prototype.clear = function () {
    this.splice(0, this.length);
};

Array.prototype.insertArray = function (start, array) {
    var len = this.length;
    if (start >= 0 && start <= this.length) {
        for (var i = 0, arrayLen = array.length; i < arrayLen; i++) {
            var ele = array[i];
            this.splice(start + i, 0, ele);
        }
    }
};

//ele换到afterEle之后
Array.prototype.transposition = function (ele,  afterEle) {
    var newIndex = this.indexOf(afterEle)+1;
    var index = this.indexOf(ele);
    if (index != -1 && newIndex >= 0 && newIndex < this.length && newIndex != ele) {

        //往前换
        if (newIndex < index) {
            for (var i = index; i > newIndex; i--) {
                this[i] = this[i - 1];
            }
            this[newIndex] = ele;
        }

        //往后换
        else if(newIndex>index){
            for(var i=index;i<newIndex;i++){
                this[i]=this[i+1];
            }
            this[newIndex]=ele;
        }
    }
};

/**
 * 日期格式化输出
 * @param format  yyyy-MM-dd
 */
Date.prototype.toFormatString = function (format) {
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    };
    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o) if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

/**
 * 伪hash表
 * @constructor
 */
function Hashtable() {
    this._hash = {};
    this._count = 0;
    this.add = function (key, value) {
        if (this._hash.hasOwnProperty(key)) return false;
        else {
            this._hash[key] = value;
            this._count++;
            return true;
        }
    };
    this.remove = function (key) {
        delete this._hash[key];
        this._count--;
    };
    this.count = function () {
        return this._count;
    };
    this.items = function (key) {
        if (this.contains(key))
            return this._hash[key];
        else
            return undefined;
    };

    this.getKey = function (value) {

        for (var prop in this._hash) {
            if (prop.propertyIsEnumerable && this._hash[prop] == value) {
                return prop;
            }
        }
        return undefined;
    };

    this.contains = function (key) {
        return this._hash.hasOwnProperty(key);
    };
    this.keys = function () {
        var keys = [];
        for (var prop in this._hash) {
            if (prop.propertyIsEnumerable) {
                keys.push(prop);
            }
        }
        return keys;
    };
    this.clear = function () {
        delete this._hash;
        this._hash = {};
        this._count = 0;
    }
}

//Guid类
var Guid = {
    //创建guid
    create: function () {
        var guid = "";
        for (var i = 1; i <= 32; i++) {
            var n = Math.floor(Math.random() * 16.0).toString(16);
            guid += n;
            if ((i == 8) || (i == 12) || (i == 16) || (i == 20))
                guid += "-";
        }
        return guid;
    }
};

//Path类
var Path = {
    //文件名称相同
    equalsFile: function (file1, file2) {
        return file1.replace('/', '\\') == file2.replace('/', '\\')
    },
    //获取文件名部分
    getFileName: function (filePath) {
        var char1 = '/',
            char2 = '\\',
            lastIndexChar1 = filePath.lastIndexOf(char1),
            lastIndexChar2 = filePath.lastIndexOf(char2),
            lastIndex = [lastIndexChar1, lastIndexChar2].max();

        return filePath.substr(lastIndex + 1);
    },
    //获取文件夹最后一级目录
    getLastDirecroty: function (dirPath) {
        var char1 = '/',
            char2 = '\\',
            lastIndexChar1 = dirPath.lastIndexOf(char1),
            lastIndexChar2 = dirPath.lastIndexOf(char2),
            lastIndex = [lastIndexChar1, lastIndexChar2].max();

        return dirPath.substr(lastIndex + 1);
    },
    //获取文件名不带后缀
    getFileNameWithoutExtension: function (filePath) {
        var fileName = this.getFileName(filePath);
        var lastIndex = fileName.lastIndexOf('.');
        return fileName.substring(0, lastIndex);
    },
    //获取文件扩展名
    getExtension: function (filePath) {
        var fileName = this.getFileName(filePath);
        var lastIndex = fileName.lastIndexOf('.');
        return fileName.substr(lastIndex);
    },
    //获取目录路径
    getDirectory: function (filePath) {
        var char1 = '/',
            char2 = '\\',
            lastIndexChar1 = filePath.lastIndexOf(char1),
            lastIndexChar2 = filePath.lastIndexOf(char2),
            lastIndex = [lastIndexChar1, lastIndexChar2].max();

        return filePath.substring(0, lastIndex);
    },
    //拼接路径
    combine: function (path1, path2, path3, path4/*,PathN*/) {
        var pathArray = [];
        for (var i = 0, len = arguments.length; i < len; i++) {
            pathArray.push(arguments[i]);
        }

        return pathArray.join('/');

    },
    //拼接路径，并且判断每个path都不是null或者undefined，否则返回空
    combineAllWithoutNull: function (path1, path2, path3/*,pathN*/) {
        var pathArray = [];
        for (var i = 0, len = arguments.length; i < len; i++) {
            if (!arguments[i] || arguments[i] == "") {
                return "";
            }
            pathArray.push(arguments[i]);
        }
        return pathArray.join('/');
    }
};


//扩展的jquery的取url参数方法
$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        //针对value中含有||&||   认为是&   ||=||   认为是=
        var identifier1 = Guid.create();
        var identifier2 = Guid.create();
        var urlHandle = window.location.href.slice(window.location.href.indexOf('?') + 1).
            replace(/\|\|&\|\|/g, identifier1).replace(/\|\|=\|\|/g, identifier2);
        var hashes = urlHandle.split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            if (hash.length == 2) {
                vars.push(hash[0]);
                var reg1 = new RegExp(identifier1, 'g');
                var reg2 = new RegExp(identifier2, 'g');
                vars[hash[0]] = hash[1].replace(reg1, '&').replace(reg2, '=');
            }
        }
        return vars;
    },
    getUrlVar: function (name) {
        return $.getUrlVars()[name];
    }
});

/* Class extends
 --------------------------------------------------------*/

function extendClass(subClass, superClass) {

    var F = function () {
    };

    F.prototype = superClass.prototype;

    subClass.prototype = new F();

    subClass.prototype.constructor = subClass;

    subClass.superclass = superClass.prototype;

    if (superClass.prototype.constructor == Object.prototype.constructor) {

        superClass.prototype.constructor = superClass;
    }
}

function mixinClass(c, mixins) {

    var prototype = {},
        constructors = mixins['concat'](c);
    $.each(constructors, function (index, ext) {

        if (ext) {
            var proto = ext.prototype;
            for (var p in proto) {

                if (proto.hasOwnProperty(p)) {
                    prototype[p] = proto[p];
                }
            }
        }
    });

    $.each(prototype, function (k, v) {

        c.prototype[k] = v;

    });
    return c;
}


function UrlRegEx(url) {
    //如果加上/g参数，那么只返回$0匹配。也就是说arr.length = 0   
    var re = /(\w+):\/\/([^\:|\/]+)(\:\d*)?(.*\/)([^#|\?|\n]+)?(#.*)?(\?.*)?/i;
    //re.exec(url);   
    var arr = url.match(re);
    return arr;
}
