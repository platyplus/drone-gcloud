#!/bin/sh
echo "$PLUGIN_GOOGLE_CREDENTIALS" | base64 -D > /tmp/.credentials
cat /tmp/credentials
gcloud auth activate-service-account --key-file /tmp/.credentials
rm /tmp/.credentials
echo "$PLUGIN_COMMANDS"
echo "$PLUGIN_CONFIG"
