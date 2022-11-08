#Open Terminal, type in sh /path/to/file and press enter.

#Faster is to type sh and a space and then drag the file to the window and release the icon anywhere on the window.

# This will run give curl command 200 times with max 10 jobs in parallel.


#seq 1 200
#seq 1 1 | xargs -I $ -n1 -P10 curl -X POST "http://localhost:4000/example"

seq 1 1 | xargs -I $ -n1 -P10 curl \
                            --header "Content-Type: application/json" \
                            -X POST "http://143.198.132.139:5000/meiHistory" \
                            --data '{"cnpj":"38294699000112"}'


