#! /bin/bash

# assert that IP and USER are set
if [ -z "$IP" ]; then
    echo "IP is not set, set it with 'IP=<ip>'"
    exit 1
fi

if [ -z "$USER" ]; then
    echo "USER is not set, using 'pi' (set it with 'USER=<user>')"
    USER=pi
fi

echo "--- building frontend ---"

pushd frontend
yarn
yarn build

echo "--- syncing to $USER@$IP ---"

rsync -r public dist --rsync-path="sudo rsync" $USER@$IP:/opt/frontend/
rsync ../nginx.conf --rsync-path="sudo rsync" $USER@$IP:/etc/nginx/nginx.conf
popd
