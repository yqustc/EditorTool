/**
 * Created by qianyao on 2015/12/21.
 */
var outline = {
    resetHandler: function(){
        var dirmap = {}, dir = editor.editor_Obj.execCommand('getsections', ['section-title', 'assessment-item']);

        // 更新目录树
        $('.outline-content').html(traversal(dir) || null);
        // 删除章节按钮
        $('.deleteIcon').click(function(e){
            var $target = $(this),
                address = $target.parent().attr('data-address');
            editor.editor_Obj.execCommand('deletesection', dirmap[address]);
        });
        // 选中章节
        $('.itemTitle').click(function(e){
            var $target = $(this),
                address = $target.parent().attr('data-address');
            $('.itemTitle').removeClass('selectedTitle');
            $target.addClass('selectedTitle');
            //editor.editor_Obj.execCommand('scrolltosection', dirmap[address]);
            //editor.editor_Obj.execCommand('selectsection', dirmap[address], true);
            $('body').animate({ scrollTop: dirmap[address].dom.offsetTop -  $('.editor-page').offset().top + $('body').scrollTop()}, 1000);
        });
        // 章节上移
        $('.moveUp,.moveDown').click(function(e){
            var $target = $(this),
                address = $target.parent().attr('data-address'),
                moveUp = $target.hasClass('moveUp') ? true:false;
            if($target.hasClass('moveUp')) {
                editor.editor_Obj.execCommand('movesection', dirmap[address], dirmap[address].previousSection);
            } else {
                editor.editor_Obj.execCommand('movesection', dirmap[address], dirmap[address].nextSection, true);
            }
        });

        function traversal(section) {
            var $list, $item, $itemContent, child, childList;
            if(section.children.length) {
                $list = $('<ul>');
                for(var i = 0; i< section.children.length; i++) {
                    child = section.children[i];
                    //设置目录节点内容标签
                    var title = getSubStr(child['title'], 12);
                    var endPos = title.indexOf('A、');
                    if( endPos>= 0){
                        title = title.substring(0, endPos);
                    }
                    $itemContent = $('<div class="sectionItem"></div>').html($('<span class="itemTitle">' + title + '</span>'));
                    $itemContent.attr('data-address', child['startAddress'].join(','));
                    $itemContent.append($('<span class="deleteIcon"><span class="glyphicon glyphicon-remove-circle" aria-hidden="true" title="删除"></span></span>' +
                        '<span class="moveDown"><span class="glyphicon glyphicon-download" aria-hidden="true" title="下移"></span></span>' +
                        '<span class="moveUp"><span class="glyphicon glyphicon-upload" aria-hidden="true" title="上移"></span></span>'));
                    dirmap[child['startAddress'].join(',')] = child;
                    //设置目录节点容器标签
                    $item = $('<li>');
                    $item.append($itemContent);
                    //继续遍历子节点
                    if($item.children.length) {
                        childList = traversal(child);
                        childList && $item.append(childList);
                    }
                    $list.append($item);
                }
            }
            return $list;
        }
    }
};