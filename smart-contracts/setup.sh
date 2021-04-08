DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}/../test-network/"

./network.sh down
./network.sh up createChannel -c mychannel -ca -s couchdb

./network.sh deployCC -ccn basic -ccp ../smart-contracts/chaincode-typescript -ccl typescript
./network.sh deployCC -ccn farmer -ccp ../smart-contracts/chaincode-farmer -ccl typescript

cd "${DIR}/application-typescript/src"


tsc appCertificateBody.ts
tsc appFarmer.ts
tsc appProducer.ts
tsc enroll.ts

rm -r wallet
