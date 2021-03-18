### Running our current setup
1: Run ```npm install``` in the smart-contracts/application-typescript folder.
2: Export fabric-samples/bin as follows: ```export PATH=$PATH:<PATH_TO_fabric-samples/bin>```
3: Run ```. setup.sh``` in the smart-contracts folder
4: You should automatically be navigated into smart-contracts/application-typescript/src, from here execute ```node app.js``` and you should see that the blockchain is working.
5: After the program is finished (you will no longer see any output) exit it using ctrl+c