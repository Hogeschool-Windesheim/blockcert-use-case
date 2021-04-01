### Running our current setup
1: First install the hyperledger-fabric binaries that can be installed at https://hyperledger-fabric.readthedocs.io/en/release-2.2/install.html

2: Export the binaries fabric-samples/bin as follows: ```export PATH=$PATH:<PATH_TO_fabric-samples/bin>```

3: Run the setup.sh script found in the smart-contracts folder

4: Go into a terminal to smart-contracts/application-typescript and execute ```npm install```

5: After dependencies are installed run ```npm start``` to start an application with a server listening on port 4100

6: Running npm startFarmer or startProducer will run these application for farmer and producer respectively.

7: Go in terminal to web-application, run ```npm install``` and ```npm start```

8: Opening browser ```localhost:4200``` should now show the web-application
