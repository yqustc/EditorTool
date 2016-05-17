/**
 * Created by qianyao on 2015/12/21.
 */
var editor = {
    //编辑器对象
    editor_Obj: null,
    //编辑器事件绑定
    eventBind: function(){
        var that = this;

        that.editor_Obj.ready(function(){
            var toolbar_obj = $('.editor-main .edui-editor-toolbarbox');
            $('#editor-toolbar').append(toolbar_obj);
        });

        //给编辑器增加一个选中改变的事件，用来判断所选内容以及状态
        that.editor_Obj.addListener('selectionchange', function (){
            //命令名称
            var cmdName = ['bold', 'italic', 'superscript', 'subscript'];

            //查询每个命令当前的状态，并设置对应状态样式
            var i = -1;
            while(i++ < cmdName.length - 1){
                var state = that.editor_Obj.queryCommandState(cmdName[i]);
                if(state == 1){
                    $('#' + cmdName[i] + '-btn').addClass('btn-active');
                }
                else{
                    $('#' + cmdName[i] + '-btn').removeClass('btn-active');
                }
            }
        });
        //编辑框点击事件
        $('.editable').unbind('click').bind('click', function(){
            that.editor_Obj.setEnabled();
        });
        $('.editable').unbind('blur').bind('blur', function(){
            that.editor_Obj.setDisabled('fullscreen');
        });
    }

};