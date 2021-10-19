"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = require("uuid");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jsLogger = /*#__PURE__*/function () {
  function jsLogger(req) {
    var _this = this;

    _classCallCheck(this, jsLogger);

    this.queue = 0;
    this.count = 0;
    this.url = req.url;
    this.timeInterval = req.time_ms ? req.time_ms : 5000;
    this.maxLogs = req.max_logs ? req.max_logs : 1000; //this.ajaxCall = ajaxCall;
    //this.common = common;
    //this.appender = appender;

    this.extraData = req.extraData;
    this.user = null;
    this.user_detail = null;
    this.isAjaxCompleted = true;
    this.mode = (req === null || req === void 0 ? void 0 : req.mode) || "info";
    setInterval(function () {
      return _this.ajaxCall();
    }, this.timeInterval);
    this.mode === "debug" && this.capptureClickEvent();
  }

  _createClass(jsLogger, [{
    key: "bind",
    value: function bind(req) {
      this.user = req.user;
      delete req.user;
      this.user_detail = req;
    } // Get data from all kinds of messages that are being logged and form a structed log.

  }, {
    key: "common",
    value: function common(options) {
      var time = new Date(); // TODO use window.location.host

      var source = window.location.host;

      var data = _objectSpread({
        UUID: (0, _uuid.v4)(),
        timestamp: time.getTime(),
        message: options.message,
        level: options.type,
        url: options.url,
        host_url: source,
        misc: options.misc
      }, this.extraData);

      if (this.user != null) {
        data["this"].user = this.user;
      }

      if (this.user_detail != null) {
        for (var key in this.user_detail) {
          data[key] = this.user_detail[key];
        }
      }

      this.appender(data);
      return;
    } // store data to localStorage

  }, {
    key: "appender",
    value: function appender(data) {
      this.count += 1;
      window.localStorage.setItem("logging_" + data.UUID, JSON.stringify(data));

      if (this.count > this.maxLogs) {
        this.ajaxCall(); // flush logs to server side.

        this.count = 0;
      }

      return;
    } // Data for logging functions

  }, {
    key: "log_data",
    value: function log_data(level, msg, url, misc) {
      var data = {
        type: level,
        message: msg,
        url: url,
        misc: misc
      };
      this.common(data);
      return;
    } // Log different kinds of console logging methods

  }, {
    key: "info",
    value: function info() {
      this.log_data("info", arguments[0], window.location.href, arguments[1]);
      console.info(arguments[0]);
      return;
    }
  }, {
    key: "error",
    value: function error() {
      this.log_data("exception", arguments[0], window.location.href, arguments[1]);
      console.error(arguments[0]);
      return;
    }
  }, {
    key: "debug",
    value: function debug() {
      this.log_data("debug", arguments[0], window.location.href, arguments[1]);
      console.debug(arguments[0]);
      return;
    }
  }, {
    key: "log",
    value: function log() {
      this.log_data("log", arguments[0], window.location.href, arguments[1]);
      console.log(arguments[0]);
      return;
    }
  }, {
    key: "warn",
    value: function warn() {
      this.log_data("warn", arguments[0], window.location.href, arguments[1]);
      console.warn(arguments[0]);
      return;
    }
  }, {
    key: "msg",
    value: function msg() {
      this.log_data("msg", arguments[0], window.location.href, arguments[1]);
      return;
    }
  }, {
    key: "exception",
    value: function exception() {
      this.log_data("exception", arguments[0], window.location.href, arguments[1]);
      console.error(arguments[0]);
      return;
    }
  }, {
    key: "constructBody",
    value: function constructBody(msg) {}
  }, {
    key: "xhrStatus",
    value: function xhrStatus(msg, req_url, xhr, startTime, is_call_success) {
      try {
        var endTime = new Date().getTime(),
            data = {
          status: xhr.status,
          ready_state: xhr.readyState,
          status_message: xhr.statusText,
          url: req_url,
          start_time_ms: startTime,
          end_time_ms: endTime,
          request_time_ms: endTime - startTime,
          response_length: xhr.responseText && xhr.responseText.length
        };

        if (!is_call_success) {
          data.response = xhr.responseText.substring(0, 2000);
        }

        this.common({
          message: msg,
          misc: data
        });
        return;
      } catch (err) {}
    } // flush logs into server

  }, {
    key: "ajaxCall",
    value: function ajaxCall() {
      if (this.isAjaxCompleted) {
        this.flushPendingLogs();
      }
    } // Send pending logs to url which is provided by checking logs that are being logged.

  }, {
    key: "flushPendingLogs",
    value: function flushPendingLogs() {
      var _this2 = this;

      this.count = 0;
      this.isAjaxCompleted = false;
      var pending_logs = 0,
          data = [],
          log_keys = [];

      for (var i in window.localStorage) {
        pending_logs = i.startsWith("logging") ? pending_logs + 1 : pending_logs;
      }

      if (pending_logs === 0) {
        this.isAjaxCompleted = true;
        return;
      }

      for (var key_index in window.localStorage) {
        if (key_index.startsWith("logging") && data.length < 1000) {
          data.push(JSON.parse(window.localStorage.getItem(key_index)));
          log_keys.push(key_index);
        }
      }

      var params = {
        logs: data
      };
      var xhr = fetch(this.url, {
        method: "POST",
        body: JSON.stringify(params),
        timeout: 1000 * 60 * 10
      }).then(function () {
        for (var _key_index in log_keys) {
          delete window.localStorage[log_keys[_key_index]];
        }
      });
      xhr["finally"](function (response) {
        pending_logs -= data.length;

        if (pending_logs > 0) {
          _this2.flushPendingLogs();
        }

        _this2.isAjaxCompleted = true;
      });
    } //Capture click events

  }, {
    key: "capptureClickEvent",
    value: function capptureClickEvent() {
      var _this3 = this;

      document.body.addEventListener("click", function (e) {
        var time = new Date(),
            data = {
          UUID: (0, _uuid.v4)(),
          timestamp: time.getTime(),
          message: "event_click",
          level: "debug",
          target: e.target.innerHTML,
          url: window.location.href
        };

        _this3.appender(data);
      }, true);
    } // fetching coverage data

  }, {
    key: "windowCoverage",
    value: function windowCoverage() {
      var _this4 = this;

      var time = new Date(),
          data = {
        UUID: (0, _uuid.v4)(),
        timestamp: time.getTime(),
        message: "coverage_data",
        level: "info",
        host_url: window.location.host,
        coverage_id: ""
      };
      fetch("/file_server/upload", {
        method: "POST",
        body: JSON.stringify(window.__coverage__)
      }).then(function (res) {
        return res.json();
      }).then(function (val) {
        data["coverage_id"] = val.md5;

        _this4.appender(data);
      });
      return;
    } // Time interval for sending logs to url
    // capture javascript errors

  }, {
    key: "catchAllError",
    value: function catchAllError() {
      var _this5 = this;

      window.console = {
        log: function log(msg) {},
        info: function info(msg) {},
        warn: function warn(msg) {},
        error: function error(msg) {
          var time = new Date(),
              data = {
            UUID: (0, _uuid.v4)(),
            timestamp: time.getTime(),
            message: msg,
            level: "error",
            host_url: window.location.host
          };

          _this5.appender(data);

          return;
        }
      };
    }
  }]);

  return jsLogger;
}();

var _default = jsLogger;
exports["default"] = _default;