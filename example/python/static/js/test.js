(function(){
    'use strict';

    var log= new jslogger({url:"/logging", max_logs:3, time_ms: 1000 * 5})

    window.inputFocus = inputFocus;
    window.inputBlur  = inputBlur;
    // Don't bother
    function inputFocus(i){
        if(i.value==i.defaultValue){ i.value=""; i.style.color="#000"; }
    }
    function inputBlur(i){
        if(i.value==""){ i.value=i.defaultValue; i.style.color="#888"; }
    }
    log.log('test.js')
    $('#send').on('click', sendLog)
    $('#name').keyup(function(ev) {
        // 13 is ENTER
        if (ev.which === 13) {
           sendLog();
        }
    });

    function sendLog(){

        var text = $('#name').val();
        if(text != 'your name' && text.length!=0) {
            log.info(text);
            $('#name').val('');
        }
    }
})();
