"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _uuid = require("uuid");

var _axios = _interopRequireDefault(require("axios"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) { symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); } keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var jsLogger = /*#__PURE__*/function () {
  function jsLogger(req) {
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
    this.host = req.host || "";
    this.user_detail = null;
    this.isAjaxCompleted = true;
    this.waitingLogs = [];
    this.mode = (req === null || req === void 0 ? void 0 : req.mode) || "info";
    this.logs = [];
    this.interval = "";
    this.mode === "debug" && this.capptureClickEvent();
  }

  _createClass(jsLogger, [{
    key: "startCheck",
    value: function startCheck() {
      var _this = this;

      if (this.interval) return;
      this.interval = setInterval(function () {
        //FIXME: replace with one function for bind and also calling
        _this.ajaxCall.bind(_this);

        _this.ajaxCall();
      }, this.timeInterval);
    }
  }, {
    key: "endCheck",
    value: function endCheck() {
      if (!this.interval) return;
      clearInterval(this.interval);
      this.interval = "";
    }
  }, {
    key: "bind",
    value: function bind(req) {
      this.user = req.user;
      delete req.user;
      this.user_detail = req;
    } // Get data from all kinds of messages that are being logged and form a structed log.

  }, {
    key: "common",
    value: function common(options) {
      var _options$misc, _options$misc2;

      var time = new Date(); // TODO use window.location.host

      var source = typeof window !== "undefined" && window !== null ? window.location.host : this.host;

      var data = _objectSpread({
        UUID: (options === null || options === void 0 ? void 0 : (_options$misc = options.misc) === null || _options$misc === void 0 ? void 0 : _options$misc.UUID) || (0, _uuid.v4)(),
        request_id: options === null || options === void 0 ? void 0 : (_options$misc2 = options.misc) === null || _options$misc2 === void 0 ? void 0 : _options$misc2.UUID,
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
    }
  }, {
    key: "storageAvailable",
    value: function storageAvailable(type, key, value) {
      var storage;

      try {
        storage = window[type];
        storage.setItem(key, value);
        storage.removeItem(key);
        return true;
      } catch (e) {
        console.error(e);
        return false;
      }
    } // store data to localStorage

  }, {
    key: "appender",
    value: function appender(data) {
      this.startCheck();

      if (typeof window !== "undefined" && window !== null) {
        if (this.storageAvailable("localStorage", "logging_" + data.UUID, JSON.stringify(data))) {
          this.count += 1;
          window.localStorage.setItem("logging_" + data.UUID, JSON.stringify(data));
        } else {
          // Too bad, no localStorage for us
          this.waitingLogs.push(data);
        }
      } else {
        this.count += 1;
        this.logs.push(JSON.stringify(data));
      }

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
        url: url !== null && url !== void 0 ? url : "",
        misc: misc
      };
      this.common(data);
      return;
    } // Log different kinds of console logging methods

  }, {
    key: "info",
    value: function info() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("info", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "error",
    value: function error() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("exception", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "debug",
    value: function debug() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("debug", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "log",
    value: function log() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("log", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "warn",
    value: function warn() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("warn", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "msg",
    value: function msg() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("msg", arguments[0], href, arguments[1]);
      return;
    }
  }, {
    key: "exception",
    value: function exception() {
      var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
      this.log_data("exception", arguments[0], href, arguments[1]);
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

      if (typeof window !== "undefined" && window !== null) {
        for (var i in window.localStorage) {
          pending_logs = i.startsWith("logging") ? pending_logs + 1 : pending_logs;
        }
      } else {
        pending_logs = this.logs;
      }

      if (!pending_logs || pending_logs === 0 || pending_logs.length === 0) {
        this.isAjaxCompleted = true;
        this.endCheck();
        return;
      }

      if (typeof window !== "undefined" && window !== null) {
        for (var key_index in window.localStorage) {
          if (key_index.startsWith("logging") && data.length < 1000) {
            data.push(JSON.parse(window.localStorage.getItem(key_index)));
            log_keys.push(key_index);
          }
        }
      } else {
        for (var _key_index in this.logs) {
          if (data.length < 1000) {
            data.push(JSON.parse(this.logs[_key_index]));
            log_keys.push(_key_index);
          }
        }
      }

      var params = {
        logs: data
      };
      var xhr = (0, _axios["default"])(this.url, {
        method: "POST",
        data: JSON.stringify(params),
        timeout: 1000 * 60 * 10
      }).then(function (res) {
        for (var _key_index2 in log_keys) {
          if (typeof window !== "undefined" && window !== null) {
            delete window.localStorage[log_keys[_key_index2]];
          } else {
            _this2.logs.splice(_key_index2, 1);
          }
        } //append waiting logs to localStorage


        for (var _i = 0; _i < _this2.waitingLogs.length; _i++) {
          _this2.appender(_this2.waitingLogs[_i]);
        }

        _this2.waitingLogs = []; // clear waiting logs
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

      if (typeof window === "undefined" || window === null) {
        return;
      }

      document.body.addEventListener("click", function (e) {
        var href = typeof window !== "undefined" && window !== null ? window.location.href : "";
        var time = new Date(),
            data = {
          UUID: (0, _uuid.v4)(),
          timestamp: time.getTime(),
          message: "event_click",
          level: "debug",
          target: e.target.innerHTML,
          url: href
        };

        _this3.appender(data);
      }, true);
    } // fetching coverage data

  }, {
    key: "windowCoverage",
    value: function windowCoverage() {
      var _this4 = this;

      var host = typeof window !== "undefined" && window === null ? window.location.host : "";
      var time = new Date(),
          data = {
        UUID: (0, _uuid.v4)(),
        timestamp: time.getTime(),
        message: "coverage_data",
        level: "info",
        host_url: host,
        coverage_id: ""
      };
      (0, _axios["default"])("/file_server/upload", {
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

      if (typeof window === "undefined" || window === null) {
        return;
      }

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