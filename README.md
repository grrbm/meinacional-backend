# HOW TO RUN THIS:

## 1) start or refresh redis on docker:
docker run --name some-redis -p 6379:6379 -d redis
docker restart some-redis

## 2) execute command "heroku local" to run server and worker files defined in package.json
(web: node dist/server.js
worker: node dist/worker.js)

(source: https://codeburst.io/worker-processes-with-heroku-by-example-49863913008f)



###### Obs: If you just want to see how the script works in your browser:

 1. Open file scraper.py
 2. Comment out these lines:
     - options.headless = True 
     - options.add_argument("--headless")
  3. run script:
     - py scraper.py <CNPJ>
  

###### Obs2: If you want to check payment code:
  > Run: 
      py print.payment.py 38294699000112 Dezembro/2021
