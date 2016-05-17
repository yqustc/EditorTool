/**
 * Created by qianyao on 2015/12/21.
 */
var toolbar = {

    eventBind: function(){
        /* 批注部分 */
        $('#create-btn').unbind('click').bind('click', function(){
            //界面显示
            $('.remark').show();
            $('.editor-page').width($('.editor-page').outerWidth() + $('.remark').outerWidth());
            var elementArray = editor.editor_Obj.selection.getStartElementPath();
            var item_Obj;
            for(var i = 0; i < elementArray.length; i++){
                if($(elementArray[i]).hasClass('assessment-item')){
                    item_Obj = $(elementArray[i]);
                    item_Obj.addClass('remark-item');
                    var item_id = item_Obj.attr('id');
                    var input_id = Guid.create();
                    var canvas_id = Guid.create();
                    var input_obj = '<textarea rows="3" class="remark-input" id="{0}" onfocus="this.style.height=((this.clientHeight > this.scrollHeight) ? this.clientHeight : this.scrollHeight) + \'px\';" onkeydown="this.style.height=((this.clientHeight > this.scrollHeight) ? this.clientHeight : this.scrollHeight) + \'px\';" onkeyup="this.style.height=((this.clientHeight > this.scrollHeight) ? this.clientHeight : this.scrollHeight) + \'px\';"></textarea>'.format(input_id);
                    var canvas_obj = '<canvas id="{0}"></canvas>'.format(canvas_id);
                    $('.remark').append(input_obj);
                    $('.remark').append(canvas_obj);
                    var offsetTop = $('iframe').contents().find('#' + item_id).offset().top + 20;
                    if(offsetTop > 0){
                        $('.remark').find('textarea#' + input_id).css('top', offsetTop + 'px');
                        $('.remark').find('canvas#' + canvas_id).css('top', offsetTop - 10 + 'px');
                        $('.remark').find('canvas#' + canvas_id).css('left', '-80px');
                        var srcPoint = { X: 150, Y: 50};
                        var destPoint = { X: 280, Y: 50};
                        remark.drawLine(canvas_id, srcPoint, destPoint);
                    }
                }
            }
        });


        /* 题型部分 */
        $('#choice-btn').unbind('click').bind('click', function(){
            $('#item-modal').unbind('shown.bs.modal').bind('shown.bs.modal', function () {
                $('#item-type').val(itemType.choice);
                $('#choice-type').parents('.form-group').show();
                $('#choice-num').parents('.form-group').show();
                $('#choice-orientation').parents('.form-group').show();
                $('#insert-position').empty();
                $('iframe').contents().find('body.view').find('.assessment-section').each(function(){
                    var id = $(this).attr('id');
                    var value = $(this).find('.section-title').text();
                    var option = '<option value="{0}">{1}</option>'.format(id, value);
                    $('#insert-position').append(option);
                });
            });
            $('#item-modal').modal('show');
        });
        $('#text-btn').unbind('click').bind('click', function(){
            $('#item-modal').unbind('shown.bs.modal').bind('shown.bs.modal', function () {
                $('#item-type').val(itemType.textEntry);
                $('#choice-type').parents('.form-group').hide();
                $('#choice-num').parents('.form-group').hide();
                $('#choice-orientation').parents('.form-group').hide();
                $('#insert-position').empty();
                $('iframe').contents().find('body.view').find('.assessment-section').each(function(){
                    var id = $(this).attr('id');
                    var value = $(this).find('.section-title').text();
                    var option = '<option value="{0}">{1}</option>'.format(id, value);
                    $('#insert-position').append(option);
                });
            });
            $('#item-modal').modal('show');
        });
        $('#confirm-btn').unbind('click').bind('click', function(){
            var itemXmlStr;
            var insertPosition = $('#insert-position').val();
            var container = $('iframe').contents().find('body.view').find('#' + insertPosition).find('.section-body');
            switch ($('#item-type').val()){
                case itemType.choice:
                    var maxChoice = maxChoiceNum[$('#choice-type').val()];
                    var choiceOrientation = $('#choice-orientation').val();
                    var choiceNum = Number($('#choice-num').val());
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
            //小题内容解析与追加
            QTIInitialize(initializePattern.addPattern, itemXmlStr, container, function(){
                //题号更新
                $('iframe').contents().find('body.view').find('.sequence').each(function(i){
                    $(this).text(i + 1 + '.');
                });
                $('#item-modal').modal('hide');
                outline.resetHandler();
            });
        });
    }
};