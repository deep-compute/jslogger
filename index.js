const { default: jsLogger } = require("./dist");
const log = new jsLogger({
  url: "/backend/jslogs",
  mode: process.env.REACT_APP_MODE || "debug",
});
log.info("LOG");
console.log(log);
