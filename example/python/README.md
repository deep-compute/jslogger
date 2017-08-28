# Python example
Example for using jslogger in python based projects.

## Requirements
- Flask framework in python needs to be installed for this example.
```
pip install Flask
```
## usage
now just run the following command from path example/python
```
python test.py
```
The following command runs a server at port 9005. we can access the page using
```
http://localhost:9005
```
Now there will be new file created in /example/python by name **test_log.txt** which stores the data that is sent from the website at [link](http://localhost:9005) (works only if server is running).
enter some text and click the button this will log the text entered in the text box into test_log.txt.
