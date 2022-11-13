# --------- NEW VERSION

## RUN LOCALLY:

just run
node index.js

## DEPLOY TO DIGITALOCEAN:

       ssh root@143.198.132.139
       cd ~/meinacional-backend
       git pull
       yarn reloadAll

## REBOOT THE SERVER

       "sudo reboot" (in ssh terminal)

## HOW TO ADD NEW SSH KEY:

open terminal inside digital ocean (NOT your pc terminal)
vim ~/.ssh/authorized_keys
paste your new public key at the beginning of file
save & exit
run `systemclt reload ssh``
Done. log in via ssh from terminal in your computer.

---

# --------- OLD VERSION

#1) start or refresh redis on docker:
docker run --name some-redis -p 6379:6379 -d redis
docker restart some-redis

#2) execute command "heroku local" to run server and worker files defined in package.json
(web: node dist/server.js
worker: node dist/worker.js)

(source: https://codeburst.io/worker-processes-with-heroku-by-example-49863913008f)

Obs: If you just want to see how the script works in your browser:
i) Open file scraper.py
ii) Comment out these lines:
options.headless = True
options.add_argument("--headless")
iii) run script:
py scraper.py <CNPJ>

Obs2: If you want to check payment code:
Run:
py print.payment.py 38294699000112 Dezembro/2021

Obs3: For installing in a Ubuntu 20.04 server:

install python3
add python3 alias 'python' to ~/.bashrc
alias python=python3.9
install all requirements like this:
python3.9 -m pip install -r requirements.txt
install chromium:
sudo apt install chromium-chromedriver
