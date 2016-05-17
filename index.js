/**
 * Created by qianyao on 2015/12/21.
 */


$(function(){
    var sizeFlag = false;
    var mouseDownFlag = false;
    var oldPoint = {};
    var dragEventFlag = {};
    var sizeSmall = function () {
        $(".container-body").height(768 - 40);
        gui.Window.get().moveTo(screen.availWidth / 2 - 512, screen.availHeight / 2 - 384);
        gui.Window.get().resizeTo(1024, 768);
        sizeFlag = false;
    }
    var sizeMax = function () {
        $(".container-body").height(screen.availHeight - 40);
        gui.Window.get().moveTo(0, 0);
        gui.Window.get().resizeTo(screen.availWidth, screen.availHeight);
        sizeFlag = true;
    }
    var dragEvent = function (e) {
        if (dragEventFlag.leftTop) {
            var a = e.pageX - oldPoint.x;
            var b = e.pageY - oldPoint.y;
            gui.Window.get().moveBy(a, b);
            gui.Window.get().resizeBy(0 - a, 0 - b);
            $(".container-body").height($(".container-body").height() - b);
            $(".container-body").width($(".container-body").width() - a);
            return;
        }
        if (dragEventFlag.rightBottom) {
            var a = e.pageX - oldPoint.x;
            var b = e.pageY - oldPoint.y;
            gui.Window.get().resizeBy(a, b);
            $(".container-body").height($(".container-body").height() + b);
            $(".container-body").width($(".container-body").width() + a);
            oldPoint.x = e.pageX;
            oldPoint.y = e.pageY;
            return;
        }
        if (dragEventFlag.rightTop) {
            var a = e.pageX - oldPoint.x;
            var b = e.pageY - oldPoint.y;
            gui.Window.get().moveBy(0, b);
            gui.Window.get().resizeBy(a, 0-b);
            $(".container-body").height($(".container-body").height() - b);
            $(".container-body").width($(".container-body").width() + a);
            oldPoint.x = e.pageX;
            return;
        }
        if (dragEventFlag.leftBottom) {
            var a = e.pageX - oldPoint.x;
            var b = e.pageY - oldPoint.y;
            gui.Window.get().moveBy(a, 0);
            gui.Window.get().resizeBy(0-a, b);
            $(".container-body").height($(".container-body").height() + b);
            $(".container-body").width($(".container-body").width() - a);
            oldPoint.y = e.pageY;
            return;
        }
        if (dragEventFlag.left) {
            var a = e.pageX - oldPoint.x;
            gui.Window.get().moveBy(a, 0);
            gui.Window.get().resizeBy(0 - a, 0);
        }
        if (dragEventFlag.right) {
            var a = e.pageX - oldPoint.x;
            gui.Window.get().resizeBy(a, 0);
            oldPoint.x = e.pageX;
            oldPoint.y = e.pageY;
        }
        if (dragEventFlag.top) {
            var a = e.pageY - oldPoint.y;
            gui.Window.get().moveBy(0, a);
            gui.Window.get().resizeBy(0, 0 - a);
            $(".container-body").height($(".container-body").height() - a);
        }
        if (dragEventFlag.bottom) {
            var a = e.pageY - oldPoint.y;
            gui.Window.get().resizeBy(0, a);
            $(".container-body").height($(".container-body").height() + a);
            oldPoint.x = e.pageX;
            oldPoint.y = e.pageY;
        }
    }
    $(document).mousemove(function (e) {
        if (mouseDownFlag) {
            dragEvent(e);
            return;
        }
        if ((e.pageX <= 4 && e.pageY <= 4) || (e.pageX >= ($(document).width() - 4) && e.pageY >= ($(document).height() - 4))) {
            $("body").css("cursor", "nw-resize");
            return;
        }
        if ((e.pageX >= ($(document).width() - 4) && e.pageY <= 4) || (e.pageX <= 4 && e.pageY >= ($(document).height() - 4))) {
            $("body").css("cursor", "ne-resize");
            return;
        }
        if (e.pageX <= 4 || e.pageX >= ($(document).width() - 4)) {
            $("body").css("cursor", "w-resize");
        }
        else if (e.pageY <= 4 || e.pageY >= ($(document).height() - 4)) {
            $("body").css("cursor", "s-resize");
        }
        else {
            $("body").css("cursor", "initial");
        }
    });
    $(document).mousedown(function (e) {
        oldPoint.x = e.pageX;
        oldPoint.y = e.pageY;
        mouseDownFlag = true;
        if (e.pageX <= 4 && e.pageY <= 4) {
            dragEventFlag.leftTop = true;
            return;
        }
        if (e.pageX >= ($(document).width() - 4) && e.pageY >= ($(document).height() - 4)) {
            dragEventFlag.rightBottom = true;
            return;
        }
        if (e.pageX >= ($(document).width() - 4) && e.pageY <= 4) {
            dragEventFlag.rightTop = true;
            return;
        }
        if (e.pageX <= 4 && e.pageY >= ($(document).height() - 4)) {
            dragEventFlag.leftBottom = true;
            return;
        }
        if (oldPoint.x <= 4) {
            dragEventFlag.left = true;
            return;
        }
        if (oldPoint.x >= ($(document).width() - 4)) {
            dragEventFlag.right = true;
            return;
        }
        if (oldPoint.y <= 4) {
            dragEventFlag.top = true;
            return;
        }
        if (oldPoint.y >= ($(document).height() - 4)) {
            dragEventFlag.bottom = true;
            return;
        }
    });
    $(document).mouseup(function () {
        mouseDownFlag = false;
        dragEventFlag.leftTop = false;
        dragEventFlag.rightBottom = false;
        dragEventFlag.leftBottom = false;
        dragEventFlag.rightTop = false;
        dragEventFlag.left = false;
        dragEventFlag.right = false;
        dragEventFlag.top = false;
        dragEventFlag.bottom = false;
    });
    $(document).keydown(function(e){
        if(e.keyCode == 123){
            e.preventDefault();
            gui.Window.get().showDevTools();
        }
    });
    $("#maxsizeBtn").click(function () {
        sizeMax();
        $(this).hide();
        $('#reductionBtn').show();
    });
    $("#reductionBtn").click(function () {
        sizeSmall();
        $(this).hide();
        $('#maxsizeBtn').show();
    });
    $("#minisizeBtn").click(function () {
        gui.Window.get().minimize();
    })
    $("#devToolBtn").click(function () {
        gui.Window.get().showDevTools();
    });
    $("#refreshBtn").click(function () {
        window.location.reload();
    });
    $("#cancelBtn").click(function () {
        window.close();
    });
    $("#toolBtns i").hover(function () {
        $(this).css("color", "red");
    }, function () {
        $(this).css("color", "");
    });
    $("#closeBtn").click(function () {
        gui.Window.get().close();
    });
});