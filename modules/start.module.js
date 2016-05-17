/**
 * Created by qianyao on 2016/1/20.
 */
var start = {
    eventBind: function(){
        //打开按钮
        $('#openFile').unbind('click').bind('click', function(){
            $('#openFileDialog').trigger('click');
        });
        //打开对话框选择文件绑定
        $('#openFileDialog').unbind('change').bind('change', function(){
            top.paperResource.PaperFullFolder = this.value;
            QTIInitialize(IndexService.initializePattern.editPattern, top.paperResource.PaperFullFolder, $('iframe').contents().find('body.view'), function(){
                console.log('试卷读取和初始化完毕！');
            });
        });
        //创建试卷按钮
        $('#create-paper').unbind('click').bind('click', function(){
            $('#createPaper-modal').modal('show');
        });
        //新建试题绑定
        $('#create-item').unbind('click').bind('click', function(){
            $('#createItem-modal').modal('show');
        });
        //选择文件夹按钮
        $('#select-btn').unbind('click').bind('click', function(){
            $('#openFolderDialog').trigger('click');
        });
        //选择文件夹绑定
        $('#openFolderDialog').unbind('change').bind('change', function(){
            $('#paperPath').val(this.value);
        });
        //新建试卷绑定
        $('#createPaper-btn').unbind('click').bind('click', function(){
            top.paperResource.PaperFullFolder = [$('#paperPath').val(), top.paperResource.PaperTemplet].join('\\');
            QTIInitialize(IndexService.initializePattern.editPattern, top.paperResource.PaperFullFolder, $('iframe').contents().find('body.view'), function(){
                console.log('试卷读取和初始化完毕！');
                $('#createPaper-modal').modal('hide');
            });
        });
        //下拉题型绑定
        $('#createItem-type').unbind('change').bind('change', function(){
            switch ($(this).val()){
                case choiceType.single:
                case choiceType.multiple:
                    $('.choice-param').show();
                    break;
                case itemType.textEntry:
                    $('.choice-param').hide();
                    break;
            }
        });
        //新建试题绑定
        $('#createItem-btn').unbind('click').bind('click', function(){
            var itemXmlStr;
            var container = $('iframe').contents().find('body.view');
            switch ($('#createItem-type').val()){
                case choiceType.single:
                case choiceType.multiple:
                    var maxChoice = maxChoiceNum[$('#createItem-type').val()];
                    var choiceOrientation = $('#createChoice-orientation').val();
                    var choiceNum = Number($('#createChoice-num').val());
                    var choicesStr = '';
                    var choiceCode = 65;
                    for(var i = 0; i < choiceNum; i++){
                        choicesStr = choicesStr + '<simpleChoice identifier="{0}"></simpleChoice>'.format(String.fromCharCode(choiceCode));
                        choiceCode++;
                    }
                    itemXmlStr = itemTypeXml.choice.format(choiceOrientation, maxChoice, choicesStr);
                    break;
                case itemType.textEntry:
                    itemXmlStr = itemTypeXml.textEntry.format('','');
                    break;
                default :
            }
            $('iframe').contents().find('body.view').empty();
            //小题内容解析与追加
            QTIInitialize(initializePattern.addPattern, itemXmlStr, container, function(){
                //题号更新
                $('iframe').contents().find('body.view').find('.sequence').each(function(i){
                    $(this).text(i + 1 + '.');
                });
                $('#createItem-modal').modal('hide');
                $('.nav-tabs li[data-target="start"]').trigger('click');
                outline.resetHandler();
            });
        });
    },
    openInitialized: function(){
        $('.nav-tabs li[data-target="start"]').trigger('click');
        outline.resetHandler();
    },
    saveFile: function(type){
        switch (type){
            case editPattern.itemPattern:
                break;
            case editPattern.paperPattern:
                break;
            default :
        }
    },
    saveItem: function(){

    },
    savePaper: function(){

    }
};