## Running the test network

You can use the `./network.sh` script to stand up a simple Fabric test network. The test network has two peer organizations with one peer each and a single node raft ordering service. You can also use the `./network.sh` script to create channels and deploy chaincode. For more information, see [Using the Fabric test network](https://hyperledger-fabric.readthedocs.io/en/latest/test_network.html). The test network is being introduced in Fabric v2.0 as the long term replacement for the `first-network` sample.

Before you can deploy the test network, you need to follow the instructions to [Install the Samples, Binaries and Docker Images](https://hyperledger-fabric.readthedocs.io/en/latest/install.html) in the Hyperledger Fabric documentation.


### Starting the Blockcert-DEMO test network

Make sure to have installed the hyperledger fabric binaries and add them to your path. For example, the binary directory found in `fabric-examples`

To test the start-up of the network, point your path to `test-network`.
```bash
./network.sh up createChannel -ca -c blockcert-test
```
This should result in a successful startup of the testing network, containig three example organisations, each with an CA authority, as well as an ordering node. Currently, only a levelDB storage has been tested, however, couchDB should be able to spinup normally. Note that this network should **NEVER** be used in a production environment and only serves an educational purpose.
Check the ouput of running `docker ps -a` to verify that the startup went smoothly. This should look like the following:

```bash
16a7f6907bcd   hyperledger/fabric-tools:latest     "/bin/bash"              52 seconds ago       Up 51 seconds                                                       cli
87870dcca23c   hyperledger/fabric-peer:latest      "peer node start"        53 seconds ago       Up 52 seconds      7051/tcp, 0.0.0.0:9051->9051/tcp                 peer0.org2.example.com
70a85eec0c38   hyperledger/fabric-peer:latest      "peer node start"        53 seconds ago       Up 52 seconds      0.0.0.0:7051->7051/tcp                           peer0.org1.example.com
8c2ffdb4c475   hyperledger/fabric-orderer:latest   "orderer"                53 seconds ago       Up 52 seconds      0.0.0.0:7050->7050/tcp, 0.0.0.0:7053->7053/tcp   orderer.example.com
1e931f6a8652   hyperledger/fabric-peer:latest      "peer node start"        53 seconds ago       Up 52 seconds      7051/tcp, 0.0.0.0:11051->11051/tcp               peer0.org3.example.com
ff7a25fda3c7   hyperledger/fabric-ca:latest        "sh -c 'fabric-ca-se…"   About a minute ago   Up 59 seconds      7054/tcp, 0.0.0.0:9054->9054/tcp                 ca_orderer
686580f6706b   hyperledger/fabric-ca:latest        "sh -c 'fabric-ca-se…"   About a minute ago   Up 59 seconds      7054/tcp, 0.0.0.0:11054->11054/tcp               ca_org3
c4ad006d1cea   hyperledger/fabric-ca:latest        "sh -c 'fabric-ca-se…"   About a minute ago   Up 59 seconds      7054/tcp, 0.0.0.0:8054->8054/tcp                 ca_org2
657703d54b66   hyperledger/fabric-ca:latest        "sh -c 'fabric-ca-se…"   About a minute ago   Up 59 seconds      0.0.0.0:7054->7054/tcp                           ca_org1
```

Happy hacking!
