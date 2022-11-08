#Open Terminal, type in sh /path/to/file and press enter.

#Faster is to type sh and a space and then drag the file to the window and release the icon anywhere on the window.

# This will run give curl command 200 times with max 10 jobs in parallel.

seq 1 200 | xargs -I $ -n1 -P10 curl -X POST "http://localhost:4000/example"

# printf '%s\n' {1..400} | xargs -I % -P 8 curl -I -X POST 'http://localhost:4000/example'