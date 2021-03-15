export PATH=$PATH:~/fabric-samples/bin

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}/../test-network/"

./network.sh down
./network.sh up createChannel -c mychannel -ca

./network.sh deployCC -ccn basic -ccp ../smart-contracts/chaincode-typescript -ccl typescript

cd "${DIR}/application-typescript/src"

tsc app.ts
rm -r wallet