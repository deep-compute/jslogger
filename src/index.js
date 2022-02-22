import { v4 as uuidv4 } from "uuid";
import axios from "axios";

class jsLogger {
  constructor(req) {
    this.queue = 0;
    this.count = 0;
    this.url = req.url;
    this.timeInterval = req.time_ms ? req.time_ms : 5000;
    this.maxLogs = req.max_logs ? req.max_logs : 1000;
    //this.ajaxCall = ajaxCall;
    //this.common = common;
    //this.appender = appender;
    this.extraData = req.extraData;
    this.user = null;
    this.host = req.host || "";
    this.user_detail = null;
    this.isAjaxCompleted = true;
    this.mode = req?.mode || "info";
    this.logs = [];
    this.interval = "";
    this.mode === "debug" && this.capptureClickEvent();
  }

  startCheck() {
    if (this.interval) return;
    this.interval = setInterval(() => this.ajaxCall(), this.timeInterval);
  }
  endCheck() {
    if (!this.interval) return;
    clearInterval(this.interval);
    this.setInterval = "";
  }
  bind(req) {
    this.user = req.user;
    delete req.user;
    this.user_detail = req;
  }

  // Get data from all kinds of messages that are being logged and form a structed log.
  common(options) {
    let time = new Date();
    // TODO use window.location.host
    let source =
      typeof window !== "undefined" && window === null
        ? window.location.host
        : this.host;
    let data = {
      UUID: uuidv4(),
      timestamp: time.getTime(),
      message: options.message,
      level: options.type,
      url: options.url,
      host_url: source,
      misc: options.misc,
      ...this.extraData,
    };

    if (this.user != null) {
      data.this.user = this.user;
    }
    if (this.user_detail != null) {
      for (let key in this.user_detail) {
        data[key] = this.user_detail[key];
      }
    }

    this.appender(data);
    return;
  }

  // store data to localStorage
  appender(data) {
    this.startCheck();
    this.count += 1;
    if (typeof window !== "undefined" && window !== null) {
      window.localStorage.setItem("logging_" + data.UUID, JSON.stringify(data));
    } else {
      this.logs.push(JSON.stringify(data));
    }

    if (this.count > this.maxLogs) {
      this.ajaxCall(); // flush logs to server side.
      this.count = 0;
    }
    return;
  }

  // Data for logging functions
  log_data(level, msg, url, misc) {
    let data = {
      type: level,
      message: msg,
      url: url ?? "",
      misc: misc,
    };
    this.common(data);
    return;
  }
  // Log different kinds of console logging methods
  info() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("info", arguments[0], href, arguments[1]);
    return;
  }

  error() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("exception", arguments[0], href, arguments[1]);
    return;
  }

  debug() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("debug", arguments[0], href, arguments[1]);
    return;
  }

  log() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("log", arguments[0], href, arguments[1]);
    return;
  }

  warn() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("warn", arguments[0], href, arguments[1]);
    return;
  }

  msg() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("msg", arguments[0], href, arguments[1]);
    return;
  }

  exception() {
    let href =
      typeof window !== "undefined" && window === null
        ? window.location.href
        : "";
    this.log_data("exception", arguments[0], href, arguments[1]);
    return;
  }
  constructBody(msg) {}
  xhrStatus(msg, req_url, xhr, startTime, is_call_success) {
    try {
      let endTime = new Date().getTime(),
        data = {
          status: xhr.status,
          ready_state: xhr.readyState,
          status_message: xhr.statusText,
          url: req_url,
          start_time_ms: startTime,
          end_time_ms: endTime,
          request_time_ms: endTime - startTime,
          response_length: xhr.responseText && xhr.responseText.length,
        };

      if (!is_call_success) {
        data.response = xhr.responseText.substring(0, 2000);
      }

      this.common({ message: msg, misc: data });
      return;
    } catch (err) {}
  }

  // flush logs into server
  ajaxCall() {
    if (this.isAjaxCompleted) {
      this.flushPendingLogs();
    }
  }

  // Send pending logs to url which is provided by checking logs that are being logged.
  flushPendingLogs() {
    this.count = 0;
    this.isAjaxCompleted = false;
    let pending_logs = 0,
      data = [],
      log_keys = [];

    if (typeof window !== "undefined" && window !== null) {
      for (let i in window.localStorage) {
        pending_logs = i.startsWith("logging")
          ? pending_logs + 1
          : pending_logs;
      }
    } else {
      pending_logs = this.logs;
    }

    if (!pending_logs || pending_logs === 0) {
      this.isAjaxCompleted = true;
      this.endCheck();
      return;
    }

    if (typeof window !== "undefined" && window !== null) {
      for (let key_index in window.localStorage) {
        if (key_index.startsWith("logging") && data.length < 1000) {
          data.push(JSON.parse(window.localStorage.getItem(key_index)));
          log_keys.push(key_index);
        }
      }
    } else {
      for (let key_index in this.logs) {
        if (data.length < 1000) {
          data.push(JSON.parse(this.logs[key_index]));
          log_keys.push(key_index);
        }
      }
    }

    let params = {
      logs: data,
    };

    let xhr = axios(this.url, {
      method: "POST",
      data: JSON.stringify(params),
      timeout: 1000 * 60 * 10,
    }).then((res) => {
      for (let key_index in log_keys) {
        if (typeof window !== "undefined" && window !== null) {
          delete window.localStorage[log_keys[key_index]];
        } else {
          this.logs.splice(key_index, 1);
        }
      }
    });

    xhr.finally((response) => {
      pending_logs -= data.length;
      if (pending_logs > 0) {
        this.flushPendingLogs();
      }
      this.isAjaxCompleted = true;
    });
  }

  //Capture click events
  capptureClickEvent() {
    if (typeof window === "undefined" || window === null) {
      return;
    }
    document.body.addEventListener(
      "click",
      (e) => {
        let href =
          typeof window !== "undefined" && window === null
            ? window.location.href
            : "";
        let time = new Date(),
          data = {
            UUID: uuidv4(),
            timestamp: time.getTime(),
            message: "event_click",
            level: "debug",
            target: e.target.innerHTML,
            url: href,
          };
        this.appender(data);
      },
      true
    );
  }

  // fetching coverage data
  windowCoverage() {
    let host =
      typeof window !== "undefined" && window === null
        ? window.location.host
        : "";
    let time = new Date(),
      data = {
        UUID: uuidv4(),
        timestamp: time.getTime(),
        message: "coverage_data",
        level: "info",
        host_url: host,
        coverage_id: "",
      };
    axios("/file_server/upload", {
      method: "POST",
      body: JSON.stringify(window.__coverage__),
    })
      .then((res) => res.json())
      .then((val) => {
        data["coverage_id"] = val.md5;
        this.appender(data);
      });

    return;
  }

  // Time interval for sending logs to url
  // capture javascript errors
  catchAllError() {
    if (typeof window === "undefined" || window === null) {
      return;
    }
    window.console = {
      log: function (msg) {},
      info: function (msg) {},
      warn: function (msg) {},
      error: (msg) => {
        let time = new Date(),
          data = {
            UUID: uuidv4(),
            timestamp: time.getTime(),
            message: msg,
            level: "error",
            host_url: window.location.host,
          };

        this.appender(data);
        return;
      },
    };
  }
}

export default jsLogger;
