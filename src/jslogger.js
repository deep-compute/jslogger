;(function() {
    'use strict';

    function jslogger(req) {

        this.ajax      = ajax;
        this.getJSON   = getJSON;
        this.get       = get;
        this.post      = post;
        this.exception = exception;
        this.info      = info;
        this.error     = error;
        this.debug     = debug;
        this.log       = log;
        this.warn      = warn;
        this.message   = msg;
        this.bind      = bind;

        var queue           = 0,
            count           = 0,
            url             = req.url,
            timeInterval    = req.time_ms ? req.time_ms : 5000,
            maxLogs         = req.max_logs ? req.max_logs : 1000,
            ajaxCall        = ajaxCall,
            common          = common,
            appender        = appender,
            user            = null,
            user_detail     = null,
            isAjaxCompleted = true;

        function bind(req){

            user = req.user;
            delete req.user;
            user_detail = req;
        }

        // Get data from all kinds of messages that are being logged and form a structed log.
        function common(options) {

            var time = new Date();
            // TODO use window.location.host
            var source = window.location.host
            var data = {
                UUID      : uuidv1(),
                timestamp : time.getTime(),
                message   : options.message,
                level     : options.type,
                url       : options.url,
                host_url  : source,
                misc      : options.misc
            }

            if(user != null) {
                data.user = user;
            }
            if(user_detail != null) {
                for(var key in user_detail) {
                    data[key] = user_detail[key];
                }
            }

            appender(data);
            return;
        }

        // store data to localStorage
        function appender(data) {

            count += 1;
            window.localStorage.setItem("logging_" + data.UUID, JSON.stringify(data));

            if(count > maxLogs) {
                ajaxCall();     // flush logs to server side.
                count = 0;
            }
            return;
        }

        // Data for logging functions
        function log_data(level, msg, url, misc){
            var data = {
                type    : level,
                message : msg,
                url     : url,
                misc    : misc
            }
            common(data);
            return;
        }


        // Log different kinds of console logging methods
        function info() {

            log_data("info", arguments[0], window.location.href, arguments[1]);
            console.info(arguments[0]);
            return;
        }

        function error() {

            log_data("exception", arguments[0], window.location.href, arguments[1]);
            console.error(arguments[0]);
            return;
        }

        function debug() {

            log_data("debug", arguments[0], window.location.href, arguments[1]);
            console.debug(arguments[0]);
            return;
        }

        function log() {

            log_data("log", arguments[0], window.location.href, arguments[1]);
            console.log(arguments[0]);
            return;
        }

        function warn() {

            log_data("warn", arguments[0], window.location.href, arguments[1]);
            console.warn(arguments[0]);
            return;
        }

        function msg() {

            log_data("msg", arguments[0], window.location.href, arguments[1]);
            return;
        }

        function exception() {

            log_data("exception", arguments[0], window.location.href, arguments[1]);
            console.error(arguments[0]);
            return;
        }

        function xhrStatus(msg, req_url, xhr, startTime, is_call_success) {

            try{
                var endTime = new Date().getTime(),
                    data   = {
                    status          : xhr.status,
                    ready_state     : xhr.readyState,
                    status_message  : xhr.statusText,
                    url             : req_url,
                    start_time_ms   : startTime,
                    end_time_ms     : endTime,
                    request_time_ms : endTime-startTime,
                    response_length : xhr.responseText && xhr.responseText.length
                }

                if(!is_call_success) {
                    data.response = xhr.responseText.substring(0,2000);
                }

                common({message:msg, misc:data});
                return;
            }
            catch(err) {}
        }

        // Log ajax call
        function ajax(data) {

            var startTime = new Date().getTime(),
                xhr       = ($.ajax(data));

            xhr.done(function() {
                xhrStatus('ajax success', data.url, xhr, startTime, true);
            });

            xhr.fail(function() {
                xhrStatus('ajax failed', data.url, xhr, startTime, false);
            });

            return xhr;
        }

        // Log getJSON call
        function getJSON(req_url, fun) {

            var startTime = new Date().getTime(),
                xhr       = $.getJSON(req_url, fun);
            xhr.done(function() {
                xhrStatus('getJSON success', req_url, xhr, startTime, true);
            });

            xhr.fail(function() {
                xhrStatus('getJSON failed', req_url, xhr, startTime, false);
            });

            return xhr;
        }

        // Log get call
        function get(req_url, fun) {

            var startTime = new Date().getTime(),
                xhr       = $.get(req_url, fun);
            xhr.done(function() {
                xhrStatus('get request success', req_url, xhr, startTime, true);
            });

            xhr.fail(function() {
                xhrStatus('get request failed', req_url, xhr, startTime, false);
            });

            return xhr;
        }

        // Log post call
        function post(req_url, fun) {

            var startTime = new Date().getTime(),
                xhr       = $.post(req_url, fun);
            xhr.done(function() {
                xhrStatus('post request success', req_url, xhr, startTime, true);
            });

            xhr.fail(function() {
                xhrStatus('post request failed', req_url, xhr, startTime, false);
            });

            return xhr;
        }

        // flush logs into server
        function ajaxCall() {

            if(isAjaxCompleted) {
                flushPendingLogs();
            }
        }

        // Send pending logs to url which is provided by checking logs that are being logged.
        function flushPendingLogs() {

            count = 0;
            isAjaxCompleted  = false;
            var pending_logs = 0,
                data         = [],
                log_keys     = [];

            for(var i in window.localStorage){
                pending_logs = i.startsWith('logging') ? pending_logs + 1 : pending_logs;
            }

            if(pending_logs == 0) {
                isAjaxCompleted = true;
                return;
            }

            for(var key_index in window.localStorage) {
                if(key_index.startsWith('logging') && data.length < 1000) {
                    data.push(JSON.parse(window.localStorage.getItem(key_index)));
                    log_keys.push(key_index);
                }
            }

            var params = {
                logs : data,
            }

            var xhr = $.ajax({
                url     : url,
                type    : 'POST',
                data    : JSON.stringify(params),
                timeout : 1000 * 60 * 10,
                success : function() {
                    for(var key_index in log_keys) {
                        delete window.localStorage[log_keys[key_index]]
                    }
                },
            });

            xhr.always(function(response) {

                pending_logs -= data.length;
                if(pending_logs > 0) {
                    flushPendingLogs();
                }

                isAjaxCompleted = true;
            });
        }

        // Time interval for sending logs to url
        setInterval(function() {
            ajaxCall();
        }, timeInterval);

        // capture javascript errors
        window.onerror = function(message, source, lineno, colno, error) {

            var time = new Date(),
                data = {
                "UUID"      : uuidv1(),
                "timestamp" : time.getTime(),
                "message"   : message,
                "url"       : source,
                "lineno"    : lineno,
                "colno"     : colno,
                "error"     : error,
                "level"     : "javascript",
                "host_url"  : window.location.host
            }

            appender(data);
            return;
        }

        ajaxCall();
    }

window.jslogger = jslogger;
})();
