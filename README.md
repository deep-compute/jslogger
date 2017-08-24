# jslogger
Logging Javascript logs to server.
## Dependencies
Jslogger need jquery to be imported.
## Usage
Download the src/jslogger-bundle.js and copy to desired location.
Include jslogger.js in your page using below code.
```javascript
<script type="text/javascript" src="jslogger-bundle.js"></script>
```
## Initialize jslogger in your webpage
Initializing jslogger.js
```javascript
<script type="text/javascript">
    var log = new jslogger({url:url, max_logs:max_logs, time_ms:time_ms});
</script>
```
- url - Replace this with backend url where a function is listening for post request with a parameter **log**.
- max_logs - Maximum number of logs to be packed and send to server at a time (optional default 1000).
- time_ms - At what time interval all the logs needs to be checked and sent to server (optional default 5000ms).

Jslogger can bind user(string), if it is a login based website, by using:
```javascript
log.bind({user:user, key:'additional info about user'})
```
The additional information will be logged with the key specified.

Jslogger supports the following console methods for logging in below way:
```javascript
log.message(message, {data:"anykind of data"});
log.info(message, {data:"anykind of data"});
log.log(message, {data:"anykind of data"});
log.error(message, {data:"anykind of data"});
log.debug(message, {data:"anykind of data"});
log.warn(message, {data:"anykind of data"});
```
#### Example
```bash
log.info('testing log.info', {data:(new Date()).getTime()})
```
Jslogger can log exceptions using log.exception
#### Example
```javascript
try {
    throw new Error('testing jslogger');
}
catch(e){
    log.exception(e.message);
}
```
## Log ajax calls
- Jslogger can log ajax calls by calling a function as **log.ajax** similar to **$.ajax** but in addition to it, jslogger log the time taken, start time, end time, ajax url, etc.
```javascript
log.ajax({
    url: url,
    type: GET/POST,
    data: data,
    success: function(response){
        log.log('any message if needed' + {response: response});
    }
});
```
Jslogger even logs ajax call failure automatically.

- Can log getJSON calls by calling a function as **log.getJSON** instead of **$.getJSON**
```javascript
 log.getJSON(url, function(response){
      // your code goes here
 })
```
- Can also log **\$.get** and **\$.post** in the above manner using **log.get** and **log.post**

- When ever there is a javascript error it captures and logs it.
- It uses localstorage in browser to store all the logs, even if the browser crashes the logs will not be destroyed. They will be logged to server when the page loads again.
- Jslogger uses Epoch time(Unix time) for logging.
## Server side
- The logs will be logged via ajax call in post method with a variable **log**. The server side script should be able to take the request with argument **log**. Below is a example of form data for ajax call.
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
