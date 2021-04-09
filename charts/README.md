# Owkin chart repositories
Value configuration files used by Helm Charts created by owkins', available on [owkins repository](https://github.com/owkin/charts).
Note that these values are to be provided to a helm command using the `-f <path-to-directory/values.yaml`. These
config files were used on `owkin/hlf:2.2.1`, but should be compatible with HLF 2.3.1 (which is used in the rest) of the
project.

## How to use

Please refer to the document [setup-ca.md](./setup-ca.md), which provides a summary of the steps that were taken to
setup an HLF production network. Note, that this documentation uses K8s and HLF, and assumes you already have a cluster
running.

To set up a K8s cluster, please refer to the documentation of K8s and Helm, and or the documentation of your service
provider. Otherwise, you could consider using `mini-kube` to deploy locally, but this might require additional tweaks
to be made to the configuration files.


## Volumes
The configuration file in [volumes/pvc-ca.yaml](volumes/pvc-ca.yaml) regards the setup of a Persistent Volume Claim using
the terminology of `kubetctl`. Such claims allow for data persistency, which is needed to allow the network to recover
from a failing node. The provided Helm charts, should, however, create these PVCs automatically upon `install`ation. These were
all run using MyDigitalOcean as a service provider, so changing the *type* of the PVC might be in place in the different
`values.yaml` files.


## TODOs
In the values configuration file you will encounter `// TODO: ...` comments, these are meant as an indication of which
values were changed, or which assumptions need to be checked. This is left as future work to be resolved.

## Remark
Note that these charts are just *an option* to realize a production system. There are other projects, such as by the
[GroeiFabriek](https://github.com/hyfen-nl/PIVT) which provide alternatives to the Helm charts that are provided here.
It must be noted, that not all charts are being maintained, so might require partial re-writes for newer versions of 
HLF.
