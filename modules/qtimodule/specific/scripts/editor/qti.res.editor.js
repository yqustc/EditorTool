/**
 * Created with JetBrains WebStorm.
 * User: dmhu@iflytek.com
 * Date: 14-10-28
 * Time: 下午2:57
 * Copyright @ www.iflytek.com
 */

var QtiResourceJX = (function (_super) {

    extendClass(QtiResourceJX, _super);

    function QtiResourceJX() {
        _super.apply(this, arguments);
    }

    /* 读取key */
    QtiResourceJX.prototype.readKey = function (key, funcName) {
        var that = this;
        this.Options.storeData.get(key, function(err, data){
            if(err){
                that.Options.exceptionHandler.apply(that, ["readkey:出错！"]);
            }
            else{
                funcName && funcName.call(this, data);
            }
        });
    };

    /* 设置key */
    QtiResourceJX.prototype.setKey = function (key, value, funcName) {
        var that = this;
        this.Options.storeData.save(key, value, function(err){
            if(err){
                that.Options.exceptionHandler.apply(that, ["setkey:出错！"]);
            }
            else{
                funcName && funcName.call(this, true);
            }
        });
    };

    /* 获取上一次答题记录结果 */
    QtiResourceJX.prototype.getLastExamRecord = function (callback) {
        callback.apply(this, [{ flag: 1, flagMsg: '成功', data: '' }]);
    };

    return QtiResourceJX;
})(QtiResource);
