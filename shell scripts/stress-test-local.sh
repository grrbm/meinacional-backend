



#To run: "sh stress-test-local.sh"

seq 1 20 | xargs -I $ -n1 -P3 curl -w "\n" \
                            --header "Content-Type: application/json" \
                            -X POST "http://localhost:5000/meiHistory" \
                            --data '{"cnpj":"38294699000112"}'