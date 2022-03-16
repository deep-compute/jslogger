# jslogger

Logging javascript logs to server

## Usage

You can install the jslogger using

```
npm install @nudjur/js-logger
```

Once installed you can import it as below in your js file

```
import jsLogger from "@nudjur/js-logger";

export const log = new jsLogger({
  url: <URL>,
  mode: <MODE>
  timeInterval: <TIME_INTERVAL>
});
```

## Configuration

1. url: The backend url where jslogger should send logs
2. mode: Backend url run on different modes such as DEBUG, INFO where if it is DEBUG mode will write debug logs such as click event
3. timeInterval: jslogger store all logs in localstorage and keeps checking if logs present and push it so we can configure the frequency by this args default: 5sec
4. maxLogs: jslogger will have a threshold that once a count of logs comes to localstorage it will start pushing we can adjust using this default : 1000

## Contributing Guideline

To contribute to the repo you clone the repo and create a new branch and start making changes in `src/index.js`.

1. Once you are done making changes do update the `package.json`

```
version: "0.0.2" => "0.0.3"
```

2. After updating version we will need to build also we can do that by using

```
npm run build
```

3. After this we can push all changes to branch and assign the maintainer for review

4. Once pr is merged maintainer will have to release to npm he can do so by

```
npm publish --access public
```

**NOTE:-** We will need to be logged in node repo for nudjur

## Server side

- The logs will be logged via axios call in post method with a variable **logs**. The server side script should be able to take the request with argument **logs**. Below is a example of form data for ajax call.

```javascript
{
log:[
        {
        UUID: '181393b0-8702-11e7-9ca6-a7e5a0572c550.8393907533887879', //sortable unique number
        level : info/log/debug/error/user message/warn/exception/ajax,
        message: 'message',
        user: 'user if specified',
        url: 'url where log happened',
        host_url: 'host url(domain)',
        misc: 'any extra data user specifies that is used while logging'
        },
        {}, {}, ....
    ]
}
```
