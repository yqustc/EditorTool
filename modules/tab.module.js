/**
 * Created by qianyao on 2016/1/8.
 */
var tabs = {
    eventBind: function(){
        $('.nav-tabs li').unbind('click').bind('click', function(){
            $('.nav-tabs li').removeClass('active');
            $(this).addClass('active');
            var type = $(this).attr('data-target');
            switch (type){
                case 'file':
                    $('.start').show();
                    $('.content').hide();
                    break;
                case 'start':
                    $('.toolbar').hide();
                    $('#start').show();
                    $('.content').show();
                    $('.start').hide();
                    break;
                case 'insert':
                    $('.toolbar').hide();
                    $('#insert').show();
                    $('.content').show();
                    $('.start').hide();
                    break;
                case 'review':
                    $('.toolbar').hide();
                    $('#review').show();
                    $('.content').show();
                    $('.start').hide();
                    break;
                default :

            }
        });
    }
};