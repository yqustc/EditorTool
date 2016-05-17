/**
 * Created by qianyao on 2015/12/21.
 */

$(function(){
    editor.editor_Obj = UE.getEditor('editor', {
        toolbars: [[
            'undo', 'redo', '|',
            'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'superscript', 'subscript', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'selectall', 'cleardoc', '|',
            'rowspacingtop', 'rowspacingbottom', 'lineheight', '|',
            'customstyle', 'paragraph', 'fontfamily', 'fontsize', '|',
            'directionalityltr', 'directionalityrtl', 'indent', '|',
            'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
            'link', 'unlink', 'anchor', '|', 'imagenone', 'imageleft', 'imageright', 'imagecenter', '|',
            'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol'
        ]],
        autotypeset:{removeClass: false, removeEmptyNode: true, removeTagNames: {div:1}},
        elementPathEnabled: false,
        allowDivTransToP: false,
        autoFloatEnabled: false,
        readonly: false,
        wordCount: false
    });

    start.eventBind();

    tabs.eventBind();

    toolbar.eventBind();

    editor.eventBind();

    editor.editor_Obj.addListener('updateSections', outline.resetHandler);

});

function getSubStr(s,l){
    var i=0,len=0;
    for(i;i<s.length;i++){
        if(s.charAt(i).match(/[^\x00-\xff]/g)!=null){
            len+=2;
        }else{
            len++;
        }
        if(len>l){ break; }
    }return s.substr(0,i);
};