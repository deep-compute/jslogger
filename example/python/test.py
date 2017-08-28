import json

from flask import Flask, request, render_template

app = Flask(__name__)

@app.route("/")
def home():
    return render_template('test.html')

@app.route("/logging", methods=["POST"])
def example_python():
    with open('test_log.txt', 'a') as inp:
        data = request.get_data()
        data = json.loads(data)
        for i in data['log']:
            inp.write(json.dumps(i)+"\n")
    return "<h2>logs are saved successfully</h2>"

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=9005)
