#!/bin/sh

sudo killall -9 node

cd /Users/gasl/Development/Crafity/utils/crafity-proxy
sudo node proxy.js &

cd /Users/gasl/Development/Crafity/clients/Analyze\ That/poc_controles/src/file_server
/usr/local/bin/nodemon fileserver.js &

cd /Users/gasl/Development/Crafity/clients/Analyze\ That/poc_controles/src/data_server
/usr/local/bin/nodemon dataserver.js &