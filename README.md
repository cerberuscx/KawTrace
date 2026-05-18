# Connor Evrmore Blockchain Explorer

Forked from https://github.com/JohnConnorNPC/EVR-TRACKY-BOI. Thank you John!

This is a "serverless" Block explorer for Evrmore.
It must to connected to an Evrmore rpc-proxy server of the type in:
```
https://github.com/EvrmoreOrg/evrmore-rpc-proxy
```
Edit the "rpcUrl" value near the top of the file "scripts/settings.js" in this repository to specify the location of the proxy server.

This explorer can be run in a browser from a file, on any web server, or converted to a single file and run off IPFS or on Github pages.

## Note:

If you want to bundle this explorer with its own proxy server, then set up the proxy using the instructions for the **evrmore-rpc-proxy** repository, create a subdirectory named "/explorer", and copy the contents of this explorer into that subdirectory.
The explorer will be available at
```
https://<proxy server address>:<port>/explorer
```

The explorer uses same-origin `POST /rpc` when the configured endpoint matches the serving host.


