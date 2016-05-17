/**
 * Created by qianyao on 2015/12/21.
 */
var remark = {
    drawLine: function(canvasId, src, dest){
        var canvas_obj = document.getElementById(canvasId);
        var ctx = canvas_obj.getContext("2d");
        ctx.beginPath();
        ctx.moveTo(src.X, src.Y);
        ctx.lineTo(dest.X, dest.Y);
        ctx.strokeStyle = '#ff0000';
        ctx.stroke();
    }
};