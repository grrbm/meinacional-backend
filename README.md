Match your development environment with your production environment (and vice versa). Make sure that the production environment (Heroku) supports your versions.

Read here about what Python versions are supported:
https://devcenter.heroku.com/articles/python-support#supported-runtimes

You can then lock that version by specifying a runtime.txt:
https://devcenter.heroku.com/articles/python-runtimes

After you made sure you are using the same Python version on both side get a copy of your installed libraries.

python3 -m pip freeze > requirements.txt

This will write all your installed Python libraries to requirements.txt. I used python3 but for you it might be called python, py or py3.

It is important to specify the Python runtime.txt because the latest Python version (3.8 and higher) does not support ntlk, see: https://pypi.org/project/nltk/

Finally explicitely specify needed Heroku buildpacks via app.json:
https://devcenter.heroku.com/articles/app-json-schema

"buildpacks": [
  {
    "url": "https://github.com/heroku/heroku-buildpack-java"
  },
  {
    "url": "https://github.com/heroku/heroku-buildpack-python"
  }
]


(source: https://stackoverflow.com/questions/60599702/nodejs-application-running-on-heroku-fails-when-getting-data-from-a-python-scrip)