# Documentation of K8s Production
This document regards the setup process that was walked through in an attempt to spinup a production network. Concepts
of both K8s and Helm are required, however, these both provide excellent quick start guides to get started. Furthermore,
there is a large set of tutorials that provide a way into the different concepts.

**Note** that this overview is the result of ~60-70 hours of reading into the different documentations of HLF, K8s,
Helm, and various other resources. It is not complete in any way shape or form, but may helm getting started with 
starting the network yourself.

**Note** that this process was done using MyDigitalOcean as service provider. Using a different service provider, such
as AWS, GCC, or otherwise, may result in the need for minor tweaks to the value files that were created.

This document regards the setup of the CA **without** TLS, and halts there. This is because when that point was achieved,
the cost of continuing was deemed higher than the payoff of a ready production network. To continue this setup, it might
be useful to re-use the cryptographic material generated by the `test-network` to get started.

## Lessons learned
Prior Docker experience permits to quickly get started with the basics of K8s, however, this does not take away that
both K8s and Helm have a learning curve. As such, acquiring a comfortable level with both HLF and K8s/Helm is adviced 
before starting on setting up a production network this way.

## Resources consulted
Throughout this work, a large set of resources was consulted in order to startup the system. The resources below are not
prioritized in any way, but may provide a means to get started more quickly.

### Hyperledger documentation
 * https://hyperledger-fabric-ca.readthedocs.io/en/latest/deployguide/ca-deploy.html
 * https://hyperledger-fabric.readthedocs.io/en/release-2.2/deployment_guide_overview.html#
 * The rest of the hyperledger documentation for relevant pointers into the different concepts of the network.

### Video documents
 * https://www.youtube.com/watch?v=J1RfcEzD9rw
 * https://www.youtube.com/watch?v=3tVk7yrGSSE
 * https://www.youtube.com/watch?v=nlvMnedvcnM

### External documentation
 * A series of excellent Medium blog posts. 
 * The IBM developer base, https://developer.ibm.com/technologies/blockchain/articles/blockchain-basics-hyperledger-fabric 


## Getting started

### Setting up environment
After setting up a Kubernetes (or minikube) cluster, make sure to setup `kubectl` and `helm` to allow the invocation 
of the different commands.

Furthermore, it can be useful to initialize a Dashboard service, to allow for easier inspection of the different pods,
and management functinoality using web interfaces.

### Setting up Ingress
Allow for inbound and outbound traffic to the cluster. This pod may also provide a means to provide encrypted 
communication. Effectively we are setting up controller for inbound traffic to the cluster. 

This step additionally requires a domain, for example `xyz` or `ml` domains can be obtained for cheap. This documentation
does not regard this setup, but could be done to allow for a more realistic setup where a connection to a remote server
is made.


```bash
kubectl create namespace ingress-controller
helm install nginx-ingress stable/nginx-ingress --namespace ingress-controller
```

Outputs:
```bash

The nginx-ingress controller has been installed.
It may take a few minutes for the LoadBalancer IP to be available.
You can watch the status by running 'kubectl --namespace ingress-controller get services -o wide -w nginx-ingress-controller'

An example Ingress that makes use of the controller:

  apiVersion: extensions/v1beta1
  kind: Ingress
  metadata:
    annotations:
      kubernetes.io/ingress.class: nginx
    name: example
    namespace: foo
  spec:
    rules:
      - host: www.example.com
        http:
          paths:
            - backend:
                serviceName: exampleService
                servicePort: 80
              path: /
    # This section is only required if TLS is to be enabled for the Ingress
    tls:
        - hosts:
            - www.example.com
          secretName: example-tls

If TLS is enabled for the Ingress, a Secret containing the certificate and key must also be provided:

  apiVersion: v1
  kind: Secret
  metadata:
    name: example-tls
    namespace: foo
  data:
    tls.crt: <base64 encoded cert>
    tls.key: <base64 encoded key>
  type: kubernetes.io/tls
```

This ingress can be further configured to allow for properly setting up the system and to allow for remote accessing.


## Setting up certificate manager
This failed for now. However, I will later attempt to setup an Ingress with potcert.ml domain for testing purposes.
```bash
helm install cert-manager owkin/cert-manager --namespace cert-manager
```



##  Setting up CA
First configure the values in the `fabric-ca/values.yaml` to a somewhat reasonable setup. Make sure to configure a 
reasonable number of machines in order to allow for sufficiently responsive interactions.

 * Set a persistent volume to "pvc-blockcert", 5Gi, check whether this is sufficient (I presume not, but alas)
 * Set `storageClass` to do-block-storage, as described by documentation of DigitalOcean
 * Set `existingClaim` to storage device.

After setting up, the following was ran. Note that ideally, a proper name-space is used to allow for services to be more
conceptionally cleaner seperated from another.

```bash
helm install org1-ca stable/hlf-ca -f hlf-ca/values.yaml

```

Outputs:

```
Run the following commands to...
1. Get the name of the pod running the Fabric CA Server:
  export POD_NAME=$(kubectl get pods --namespace default -l "app=hlf-ca,release=org1-ca" -o jsonpath="{.items[0].metadata.name}")

2. Get the application URL:
  echo "Visit http://127.0.0.1:8080 to use your application"
  kubectl port-forward $POD_NAME 8080:7054

3. Display local (admin "client" enrollment) certificate, if it has been created:
  kubectl exec $POD_NAME -- cat /var/hyperledger/fabric-ca/msp/signcerts/cert.pem

4. Enroll the bootstrap admin identity:
  kubectl exec $POD_NAME -- bash -c 'fabric-ca-client enroll -d -u http://$CA_ADMIN:$CA_PASSWORD@$SERVICE_DNS:7054'

5. Update the chart without resetting a password:
  export CA_ADMIN=$(kubectl get secret --namespace default org1-ca-hlf-ca--ca -o jsonpath="{.data.CA_ADMIN}" | base64 --decode; echo)
  export CA_PASSWORD=$(kubectl get secret --namespace default org1-ca-hlf-ca--ca -o jsonpath="{.data.CA_PASSWORD}" | base64 --decode; echo)
  helm upgrade org1-ca stable/hlf-ca --namespace default -f my-values.yaml --set adminUsername=$CA_ADMIN,adminPassword=$CA_PASSWORD
```

Note down the name of the pod and the generated certificate:

1. org1-ca-hlf-ca-cf6f4b9ff-xk6vl
2.
```
-----BEGIN CERTIFICATE-----
MIICBDCCAaugAwIBAgIUXHsubQ0p/4Z7jN+oYYCOuUcLCnYwCgYIKoZIzj0EAwIw
XzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQK
EwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdvcmcxLWNh
MB4XDTIxMDMwMzIwMTMwMFoXDTM2MDIyODIwMTMwMFowXzELMAkGA1UEBhMCVVMx
FzAVBgNVBAgTDk5vcnRoIENhcm9saW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEP
MA0GA1UECxMGRmFicmljMRAwDgYDVQQDEwdvcmcxLWNhMFkwEwYHKoZIzj0CAQYI
KoZIzj0DAQcDQgAEZP5VpXmwNWlFa7GvndRYlMZWJv0laAUKBhT5JyR7NIk4Qj8Q
yA8KY26W1g0UovvMvKNddGZvt8GO+YLefcW2f6NFMEMwDgYDVR0PAQH/BAQDAgEG
MBIGA1UdEwEB/wQIMAYBAf8CAQEwHQYDVR0OBBYEFPkC7mvU75oWaUXshqVD9Dzq
nlLGMAoGCCqGSM49BAMCA0cAMEQCIBgyUJglV0pOS3kNIE53JNLC80MqBJMJKJ7m
X4NxwUcuAiAebOBPJlM/ocNSOiqAPklUrPgXbScG9OKgOyg1WAGyvw==
-----END CERTIFICATE-----
```
3. Running command was succesful. Note that this could also be executed by using the varialbes in teh pod. Execution was also verified by running `kubectl port-forward $POD_NAME 8080:7054` and in another terminal `fabric-ca-client  enroll -u http://blockcert-admin:blockert-secret-password-eating-ponies@localhost:8080`

```bash
kubectl exec $POD_NAME -- bash -c 'fabric-ca-client enroll -d -u http://blockcert-admin:blockert-secret-password-eating-ponies@$SERVICE_DNS:7054'
2021/03/04 07:43:56 [DEBUG] Set log level:
2021/03/04 07:43:56 [DEBUG] Home directory: /var/hyperledger/fabric-ca
2021/03/04 07:43:56 [DEBUG] Client configuration settings: &{URL:http://blockcert-admin:blockert-secret-password-eating-ponies@0.0.0.0:7054 MSPDir:msp TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name: Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:<nil> Type:x509  } CSR:{CN:blocert-admin Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[org1-ca-hlf-ca-cf6f4b9ff-xk6vl] KeyRequest:0xc000364380 CA:<nil> SerialNumber:} ID:{Name: Type:client Secret: MaxEnrollments:0 Affiliation: Attributes:[] CAName:} Revoke:{Name: Serial: AKI: Reason: CAName: GenCRL:false} CAInfo:{CAName:} CAName: CSP:0xc0003644e0 Debug:true LogLevel:}
2021/03/04 07:43:56 [DEBUG] Entered runEnroll
2021/03/04 07:43:56 [DEBUG] Enrolling { Name:blockcert-admin Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:&{blocert-admin [{US North Carolina  Hyperledger Fabric }] [org1-ca-hlf-ca-cf6f4b9ff-xk6vl] 0xc000364380 <nil> } Type:x509  }
2021/03/04 07:43:56 [DEBUG] Initializing client with config: &{URL:http://0.0.0.0:7054 MSPDir:msp TLS:{Enabled:false CertFiles:[] Client:{KeyFile: CertFile:}} Enrollment:{ Name:blockcert-admin Secret:**** CAName: AttrReqs:[] Profile: Label: CSR:&{blocert-admin [{US North Carolina  Hyperledger Fabric }] [org1-ca-hlf-ca-cf6f4b9ff-xk6vl] 0xc000364380 <nil> } Type:x509  } CSR:{CN:blocert-admin Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[org1-ca-hlf-ca-cf6f4b9ff-xk6vl] KeyRequest:0xc000364380 CA:<nil> SerialNumber:} ID:{Name: Type:client Secret: MaxEnrollments:0 Affiliation: Attributes:[] CAName:} Revoke:{Name: Serial: AKI: Reason: CAName: GenCRL:false} CAInfo:{CAName:} CAName: CSP:0xc0003644e0 Debug:true LogLevel:}
2021/03/04 07:43:56 [DEBUG] Initializing BCCSP: &{ProviderName:SW SwOpts:0xc00005ff40 PluginOpts:<nil>}
2021/03/04 07:43:56 [DEBUG] Initializing BCCSP with software options &{SecLevel:256 HashFamily:SHA2 Ephemeral:false FileKeystore:0xc000353980 DummyKeystore:<nil> InmemKeystore:<nil>}
2021/03/04 07:43:56 [DEBUG] GenCSR &{CN:blocert-admin Names:[{C:US ST:North Carolina L: O:Hyperledger OU:Fabric SerialNumber:}] Hosts:[org1-ca-hlf-ca-cf6f4b9ff-xk6vl] KeyRequest:0xc000364380 CA:<nil> SerialNumber:}
2021/03/04 07:43:56 [INFO] generating key: &{A:ecdsa S:256}
2021/03/04 07:43:56 [DEBUG] generate key from request: algo=ecdsa, size=256
2021/03/04 07:43:56 [INFO] encoded CSR
2021/03/04 07:43:56 [DEBUG] Sending request
POST http://0.0.0.0:7054/enroll
{"hosts":["org1-ca-hlf-ca-cf6f4b9ff-xk6vl"],"certificate_request":"-----BEGIN CERTIFICATE REQUEST-----\nMIIBXzCCAQUCAQAwZzELMAkGA1UEBhMCVVMxFzAVBgNVBAgTDk5vcnRoIENhcm9s\naW5hMRQwEgYDVQQKEwtIeXBlcmxlZGdlcjEPMA0GA1UECxMGRmFicmljMRgwFgYD\nVQQDEw9ibG9ja2NlcnQtYWRtaW4wWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAAQ0\nbftkvmP+uJOHHVHkyvhhogXXOLerzBoVcu5pAft1EdwCt7XDEeBd5Dv0U4qXrG0I\nNQWCipJmkPkZn2CgfzK7oDwwOgYJKoZIhvcNAQkOMS0wKzApBgNVHREEIjAggh5v\ncmcxLWNhLWhsZi1jYS1jZjZmNGI5ZmYteGs2dmwwCgYIKoZIzj0EAwIDSAAwRQIh\nANuJIwAorM28+NB5s+VVCrD/DG9qqspredsdo+M4Ir5MAiB0LTDDll4wyDhJWpno\ncBYkWkrS5KrFgOPtywbEwph2Yg==\n-----END CERTIFICATE REQUEST-----\n","profile":"","crl_override":"","label":"","NotBefore":"0001-01-01T00:00:00Z","NotAfter":"0001-01-01T00:00:00Z","CAName":""}
2021/03/04 07:43:57 [DEBUG] Received response
statusCode=201 (201 Created)
2021/03/04 07:43:57 [DEBUG] Response body result: map[Cert:LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNWRENDQWZ1Z0F3SUJBZ0lVTGZkZWRYTjBabjQ4L3loelF0M1NGT2wrRmpFd0NnWUlLb1pJemowRUF3SXcKWHpFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1SUXdFZ1lEVlFRSwpFd3RJZVhCbGNteGxaR2RsY2pFUE1BMEdBMVVFQ3hNR1JtRmljbWxqTVJBd0RnWURWUVFERXdkdmNtY3hMV05oCk1CNFhEVEl4TURNd05EQTNNemt3TUZvWERUSXlNRE13TkRBM05EUXdNRm93WnpFTE1Ba0dBMVVFQmhNQ1ZWTXgKRnpBVkJnTlZCQWdURGs1dmNuUm9JRU5oY205c2FXNWhNUlF3RWdZRFZRUUtFd3RJZVhCbGNteGxaR2RsY2pFUApNQTBHQTFVRUN4TUdZMnhwWlc1ME1SZ3dGZ1lEVlFRREV3OWliRzlqYTJObGNuUXRZV1J0YVc0d1dUQVRCZ2NxCmhrak9QUUlCQmdncWhrak9QUU1CQndOQ0FBUTBiZnRrdm1QK3VKT0hIVkhreXZoaG9nWFhPTGVyekJvVmN1NXAKQWZ0MUVkd0N0N1hERWVCZDVEdjBVNHFYckcwSU5RV0NpcEpta1BrWm4yQ2dmeks3bzRHTU1JR0pNQTRHQTFVZApEd0VCL3dRRUF3SUhnREFNQmdOVkhSTUJBZjhFQWpBQU1CMEdBMVVkRGdRV0JCVDV0dW0xMVNUSVVKNlpVRXhjCnlRcllnVC9oWERBZkJnTlZIU01FR0RBV2dCVDVBdTVyMU8rYUZtbEY3SWFsUS9RODZwNVN4akFwQmdOVkhSRUUKSWpBZ2doNXZjbWN4TFdOaExXaHNaaTFqWVMxalpqWm1OR0k1Wm1ZdGVHczJkbXd3Q2dZSUtvWkl6ajBFQXdJRApSd0F3UkFJZ005VCtNQ21QV3VzWUVFM2dJRi91ckxrM0ZEM2JMNVpHcVE0bklSLzJHZk1DSUNLOWxBK2s5TVNuClNxaGlNSEpXS0RPV1AyRnJ1LzNvQTdpa3FlbmN3amhNCi0tLS0tRU5EIENFUlRJRklDQVRFLS0tLS0K ServerInfo:map[IssuerPublicKey:CgJPVQoEUm9sZQoMRW5yb2xsbWVudElEChBSZXZvY2F0aW9uSGFuZGxlEkQKIN4uAzz+nC0AUACXaWFsqA3tApW4lJTf0WDBdayEvHELEiCbmPDW1IVZm9AowZLqQe0qGK5z5tqdg6ZGJxhOaBG4VhpECiAZGx+4Ob3eRi/jD1r0gCDIJSLUVskGBzjIjSYSTDbbHhIgL2xxqJ6MW+sQe2/ptveOJyPwkHwacoUPljy3Ej9yofMiRAogobsB6/H2NeGT33YOLcwx+oQy12llW29Kcl1hJzQ+9MYSIG6DDiwrIJkBRbPFhbQP1AX+fqjq3irFBXAr+C6ywAy/IkQKIG5P68ISrNRkpquDvxjarQZ1gDIeqIkBm57rpei92o53EiC+KVox7r92N56vFqrpLBLJ+DaCjfP0d3NUMk7DuJpvzyJECiD/jakKJdhGtuMa6zR2kilCUil54HE/dGDiyY5ozpIPjhIguEjI5zh0cCf8RZp2DXLvudSvq/VFp4vPEcuxmCBnljMiRAogyRiJhDf2b/63oqVv+em5/ScsCME1LwD79ifFytEXqM0SICsa5lCeh/Iptmdk5+0M5cf3UI1g8nAIHopHxzTHMpqXKogBCiA7rikzlB9iK+FS4E1RXW99gBDt7DJhvMeevuov2WRu/xIgl2mPQ2fPEqKaoPDC/6w8bOk3ZqQTGA10ZX2pkuaql9QaIJYK2uohu+zL8vsZDibYIbX99lYRkCyUFyYy0G1uMpWLIiDnzwqKg/NxLtyQ7sToycZk5dcF9FO0+/BcoYTWY9sTSTJECiBhSqC19L7iK2FOc/PPdgHs5IUdfppkxhr2TYEYPH5KARIgCCQySsZR9VshfhtO/OKhkvCS27lO871uunyRwPZ4xR86RAogPEj5r8pGw/R5mcHRUljSP9KCYaV149BHoaLPacxUgNgSIJCnexJgyonTCNscnldfV7wxTl8WLFiYv3koAwSjqUyoQiB32WuRh2YaxuwXaZ9VDTA7sQJCR/NU1+1MXe868bQPrkogJ6CQggFHrzsnPTDLiTV8pM5fZWaiAdGOtNbA4lO5EM9SIPlFoeBAha/70b8oGeHTarfv/xV+8pGZISUjE3UOIgh5 IssuerRevocationPublicKey:LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUhZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUNJRFlnQUVSdFphbG1XOHhGckhWOXM4amFKbm44MlVSZUVta1llegpyTDNGWjJySW9kMFlHZTd0emprVElqNElzOUI5dFdYZkVCSlpaSDJyeDMyeGw3ajhVYTdFakV4QTcrdVdjUlNnCkpsVTZ2Mm1ZYWhMcTJuVnVjb2c2NmdGakRNOUdKdU1WCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo= Version: CAName:org1-ca CAChain:LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNCRENDQWF1Z0F3SUJBZ0lVWEhzdWJRMHAvNFo3ak4rb1lZQ091VWNMQ25Zd0NnWUlLb1pJemowRUF3SXcKWHpFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1SUXdFZ1lEVlFRSwpFd3RJZVhCbGNteGxaR2RsY2pFUE1BMEdBMVVFQ3hNR1JtRmljbWxqTVJBd0RnWURWUVFERXdkdmNtY3hMV05oCk1CNFhEVEl4TURNd016SXdNVE13TUZvWERUTTJNREl5T0RJd01UTXdNRm93WHpFTE1Ba0dBMVVFQmhNQ1ZWTXgKRnpBVkJnTlZCQWdURGs1dmNuUm9JRU5oY205c2FXNWhNUlF3RWdZRFZRUUtFd3RJZVhCbGNteGxaR2RsY2pFUApNQTBHQTFVRUN4TUdSbUZpY21sak1SQXdEZ1lEVlFRREV3ZHZjbWN4TFdOaE1Ga3dFd1lIS29aSXpqMENBUVlJCktvWkl6ajBEQVFjRFFnQUVaUDVWcFhtd05XbEZhN0d2bmRSWWxNWldKdjBsYUFVS0JoVDVKeVI3TklrNFFqOFEKeUE4S1kyNlcxZzBVb3Z2TXZLTmRkR1p2dDhHTytZTGVmY1cyZjZORk1FTXdEZ1lEVlIwUEFRSC9CQVFEQWdFRwpNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUV3SFFZRFZSME9CQllFRlBrQzdtdlU3NW9XYVVYc2hxVkQ5RHpxCm5sTEdNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJQmd5VUpnbFYwcE9TM2tOSUU1M0pOTEM4ME1xQkpNSktKN20KWDROeHdVY3VBaUFlYk9CUEpsTS9vY05TT2lxQVBrbFVyUGdYYlNjRzlPS2dPeWcxV0FHeXZ3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=]]
2021/03/04 07:43:57 [DEBUG] newEnrollmentResponse blockcert-admin
2021/03/04 07:43:57 [INFO] Stored client certificate at /var/hyperledger/fabric-ca/msp/signcerts/cert.pem
2021/03/04 07:43:57 [INFO] Stored root CA certificate at /var/hyperledger/fabric-ca/msp/cacerts/0-0-0-0-7054.pem
2021/03/04 07:43:57 [INFO] Stored Issuer public key at /var/hyperledger/fabric-ca/msp/IssuerPublicKey
2021/03/04 07:43:57 [INFO] Stored Issuer revocation public key at /var/hyperledger/fabric-ca/msp/IssuerRevocationPublicKey
```

#### Checking whether this worked
To check whether the setup works, in case you don't have your ingress setup correctly, run the following two commands in 
two terminal emulators. First forward the port of your local machine to the cluster.
```bash
kubectl port-forward $CA_NODE 8080:7054
```
Then perform a GET request to the accesspoint of your CA.
```bash
curl http://localhost:7054/cainfo
```
This should return a reply in json format, you might want to append the previous command (or any command that returns json)
with `| jq .` to pretty print using `jq`.

```
{"result":{"CAName":"org1-ca","CAChain":"LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSUNCRENDQWF1Z0F3SUJBZ0lVWEhzdWJRMHAvNFo3ak4rb1lZQ091VWNMQ25Zd0NnWUlLb1pJemowRUF3SXcKWHpFTE1Ba0dBMVVFQmhNQ1ZWTXhGekFWQmdOVkJBZ1REazV2Y25Sb0lFTmhjbTlzYVc1aE1SUXdFZ1lEVlFRSwpFd3RJZVhCbGNteGxaR2RsY2pFUE1BMEdBMVVFQ3hNR1JtRmljbWxqTVJBd0RnWURWUVFERXdkdmNtY3hMV05oCk1CNFhEVEl4TURNd016SXdNVE13TUZvWERUTTJNREl5T0RJd01UTXdNRm93WHpFTE1Ba0dBMVVFQmhNQ1ZWTXgKRnpBVkJnTlZCQWdURGs1dmNuUm9JRU5oY205c2FXNWhNUlF3RWdZRFZRUUtFd3RJZVhCbGNteGxaR2RsY2pFUApNQTBHQTFVRUN4TUdSbUZpY21sak1SQXdEZ1lEVlFRREV3ZHZjbWN4TFdOaE1Ga3dFd1lIS29aSXpqMENBUVlJCktvWkl6ajBEQVFjRFFnQUVaUDVWcFhtd05XbEZhN0d2bmRSWWxNWldKdjBsYUFVS0JoVDVKeVI3TklrNFFqOFEKeUE4S1kyNlcxZzBVb3Z2TXZLTmRkR1p2dDhHTytZTGVmY1cyZjZORk1FTXdEZ1lEVlIwUEFRSC9CQVFEQWdFRwpNQklHQTFVZEV3RUIvd1FJTUFZQkFmOENBUUV3SFFZRFZSME9CQllFRlBrQzdtdlU3NW9XYVVYc2hxVkQ5RHpxCm5sTEdNQW9HQ0NxR1NNNDlCQU1DQTBjQU1FUUNJQmd5VUpnbFYwcE9TM2tOSUU1M0pOTEM4ME1xQkpNSktKN20KWDROeHdVY3VBaUFlYk9CUEpsTS9vY05TT2lxQVBrbFVyUGdYYlNjRzlPS2dPeWcxV0FHeXZ3PT0KLS0tLS1FTkQgQ0VSVElGSUNBVEUtLS0tLQo=","IssuerPublicKey":"CgJPVQoEUm9sZQoMRW5yb2xsbWVudElEChBSZXZvY2F0aW9uSGFuZGxlEkQKIN4uAzz+nC0AUACXaWFsqA3tApW4lJTf0WDBdayEvHELEiCbmPDW1IVZm9AowZLqQe0qGK5z5tqdg6ZGJxhOaBG4VhpECiAZGx+4Ob3eRi/jD1r0gCDIJSLUVskGBzjIjSYSTDbbHhIgL2xxqJ6MW+sQe2/ptveOJyPwkHwacoUPljy3Ej9yofMiRAogobsB6/H2NeGT33YOLcwx+oQy12llW29Kcl1hJzQ+9MYSIG6DDiwrIJkBRbPFhbQP1AX+fqjq3irFBXAr+C6ywAy/IkQKIG5P68ISrNRkpquDvxjarQZ1gDIeqIkBm57rpei92o53EiC+KVox7r92N56vFqrpLBLJ+DaCjfP0d3NUMk7DuJpvzyJECiD/jakKJdhGtuMa6zR2kilCUil54HE/dGDiyY5ozpIPjhIguEjI5zh0cCf8RZp2DXLvudSvq/VFp4vPEcuxmCBnljMiRAogyRiJhDf2b/63oqVv+em5/ScsCME1LwD79ifFytEXqM0SICsa5lCeh/Iptmdk5+0M5cf3UI1g8nAIHopHxzTHMpqXKogBCiA7rikzlB9iK+FS4E1RXW99gBDt7DJhvMeevuov2WRu/xIgl2mPQ2fPEqKaoPDC/6w8bOk3ZqQTGA10ZX2pkuaql9QaIJYK2uohu+zL8vsZDibYIbX99lYRkCyUFyYy0G1uMpWLIiDnzwqKg/NxLtyQ7sToycZk5dcF9FO0+/BcoYTWY9sTSTJECiBhSqC19L7iK2FOc/PPdgHs5IUdfppkxhr2TYEYPH5KARIgCCQySsZR9VshfhtO/OKhkvCS27lO871uunyRwPZ4xR86RAogPEj5r8pGw/R5mcHRUljSP9KCYaV149BHoaLPacxUgNgSIJCnexJgyonTCNscnldfV7wxTl8WLFiYv3koAwSjqUyoQiB32WuRh2YaxuwXaZ9VDTA7sQJCR/NU1+1MXe868bQPrkogJ6CQggFHrzsnPTDLiTV8pM5fZWaiAdGOtNbA4lO5EM9SIPlFoeBAha/70b8oGeHTarfv/xV+8pGZISUjE3UOIgh5","IssuerRevocationPublicKey":"LS0tLS1CRUdJTiBQVUJMSUMgS0VZLS0tLS0KTUhZd0VBWUhLb1pJemowQ0FRWUZLNEVFQUNJRFlnQUVSdFphbG1XOHhGckhWOXM4amFKbm44MlVSZUVta1llegpyTDNGWjJySW9kMFlHZTd0emprVElqNElzOUI5dFdYZkVCSlpaSDJyeDMyeGw3ajhVYTdFakV4QTcrdVdjUlNnCkpsVTZ2Mm1ZYWhMcTJuVnVjb2c2NmdGakRNOUdKdU1WCi0tLS0tRU5EIFBVQkxJQyBLRVktLS0tLQo=","Version":"1.4.3"}
,"errors":[],"messages":[],"success":true}
```

Indicatign to me that this is seemingly working.


## Register Ordering
Continue by setting up the ordering services. Note that the command contain the passwords. This should generally be 
avoided. For example, secret environmental variables could be used to overcome this.
 1. OrdAdmin:
```bash
kubectl exec $POD_NAME -- bash -c 'fabric-ca-client register --id.name ord-admin --id.secret OrdAdm1nPW --id.attrs "admin=true:ecert"'
2021/03/04 13:01:33 [INFO] Configuration file location: /var/hyperledger/fabric-ca/fabric-ca-client-config.yaml
Password: OrdAdm1nPW
```
 2. PeerAdmin:
```bash
kubectl exec $POD_NAME -- bash -c 'fabric-ca-client register --id.name peer-admin --id.secret PeerAdm1nPW --id.attrs "admin=true:ecert"'
2021/03/04 13:02:25 [INFO] Configuration file location: /var/hyperledger/fabric-ca/fabric-ca-client-config.yaml
Password: PeerAdm1nPW
```

## Setup the MSP?
Note that this step can better be done by re-using the scripts of the test-network. Note, however, that this is not best
practise, and the HLF documentation provides pointers on how to do this for actual production. The test network was not
available as it currently is in the repostitory, causing this to be done using the `fabric-samples` provided crypto
material.


Then we clone some stuff and set another variable:

```bash
cd ~/fabric-ca
mkdir confg/OrdererMSP/admincerts

FABRIC_CA_CLIENT_HOME=./config ./fabric-samples/bin/fabric-ca-client  enroll -u http://blockcert-admin:blockert-secret-password-eating-ponies@localhost:8080 -M ./OrdererMSP
```
Which should return the following:
```bash
2021/03/07 16:07:39 [INFO] Created a default configuration file at /home/jeroen/fabric-ca/config/fabric-ca-client-config.yaml
2021/03/07 16:07:39 [INFO] generating key: &{A:ecdsa S:256}
2021/03/07 16:07:39 [INFO] encoded CSR
2021/03/07 16:07:40 [INFO] Stored client certificate at /home/jeroen/fabric-ca/config/OrdererMSP/signcerts/cert.pem
2021/03/07 16:07:40 [INFO] Stored root CA certificate at /home/jeroen/fabric-ca/config/OrdererMSP/cacerts/localhost-8080.pem
2021/03/07 16:07:40 [INFO] Stored Issuer public key at /home/jeroen/fabric-ca/config/OrdererMSP/IssuerPublicKey
2021/03/07 16:07:40 [INFO] Stored Issuer revocation public key at /home/jeroen/fabric-ca/config/OrdererMSP/IssuerRevocationPublicKey
```

Copy the certificate to the admincert directory. This is just for bookkeeping / convinience.
```bash
cd config/OrdererMSP
cp signcerts/*  admincerts
cd -
```


### ENROL THE PEER ADMINS
TODO: Add namespaces to the commands. I need to check the blog/video on this.
```bash
FABRIC_CA_CLIENT_HOME=./config /home/jeroen/Documents/CSE/MSc/year/1/Q3/CS4160/repo/fabric-samples/bin/fabric-ca-client  enroll -u http://peer-admin:PeerAdm1nPW@localhost:8080 -M ./PeerMSP

2021/03/07 16:17:51 [INFO] generating key: &{A:ecdsa S:256}
2021/03/07 16:17:51 [INFO] encoded CSR
2021/03/07 16:17:52 [INFO] Stored client certificate at /home/jeroen/fabric-ca/config/PeerMSP/signcerts/cert.pem
2021/03/07 16:17:52 [INFO] Stored root CA certificate at /home/jeroen/fabric-ca/config/PeerMSP/cacerts/localhost-8080.pem
2021/03/07 16:17:52 [INFO] Stored Issuer public key at /home/jeroen/fabric-ca/config/PeerMSP/IssuerPublicKey
2021/03/07 16:17:52 [INFO] Stored Issuer revocation public key at /home/jeroen/fabric-ca/config/PeerMSP/IssuerRevocationPublicKey
```

And copy the certificate to and admin cert directory.
```bash
mkdir -p ./config/PeerMSP/admincerts
cp ./config/PeerMSP/signcerts/* ./config/PeerMSP/admincerts
```

## Create secretes in K8s for Orderers

Create secrets for hlf-ord-admincert. Use the from-file flag in `kubectl`

```bash
ORG_CERT=$(config/OrdMSP/admincerts/*.pem)
kubectl create secret generic  hlf-ord-admincert --from-file=cert.pem=$ORG_CERT
secret/hlf-ord-admincert created
```
Do similar for the key files (both key and cert are needed to create Genesis block)
```bash
ORG_KEY=$(ls config/OrdererMSP/keystore/*_sk)
fabric-ca kubectl create secret generic  hlf-ord-adminkey --from-file=key.pem=$ORG_CERT
secret/hlf-ord-adminkey created
```

Finally add **only** the CA certificate to the thingy
```bash
CA_CERT=$(ls ./config/OrdMSP/cacerts/*.pem)
kubectl create secret generic  hlf-ord-ca-cert --from-file=cert.pem=$CA_CERT
secret/hlf-ord-ca-cert created
```

## Create secretes in K8s in peers
TODO: ADD namespaces to the commands. I need to check the blog/video on this.

```bash
ORG_CERT=$(ls config/PeerMSP/admincerts/*.pem)
kubectl create secret generic  hlf-peer-admincert --namespace=peers --from-file=cert.pem=$ORG_CERT
secret/hlf-peer-admincert created
```
Do similar for the key files (both key and cert are needed to create Genesis block)
```bash
ORG_KEY=$(ls config/PeerMSP/keystore/*_sk)
kubectl create secret generic  hlf-peer-adminkey --namespace=peers --from-file=key.pem=$ORG_KEY
secret/hlf-peer-adminkey created
```

Finally add **only** the CA certificate to the thingy
```bash
CA_CERT=$(ls ./config/PeerMSP/cacerts/*.pem)
kubectl create secret generic  hlf-ord-ca-cert --namespace=peers --from-file=cert.pem=$CA_CERT
secret/hlf-ord-ca-cert created
```


## Fin
Here it was decided to interrupt the attempt for a production network and focus on test-network. This process was 
documented in an attempt to allow all the team members to setup a HLF production network using K8s. However, now we hope
that this provides a starting point in case K8s and Helm is considered to setup a HLF network in a future iteration.
