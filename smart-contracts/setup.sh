DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${DIR}/../test-network/"

./network.sh down
./network.sh up createChannel -c mychannel -ca

./network.sh deployCC -ccn basic -ccp ../smart-contracts/chaincode-typescript -ccl typescript

cd "${DIR}/application-typescript/src"

tsc app.ts
tsc appCertificateBody.ts
tsc appFarmer.ts
tsc appProducer.ts

rm -r wallet
rm -r walletCert
rm -r walletFarmer
rm -r walletProducer