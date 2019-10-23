#!/bin/sh
echo "$PLUGIN_GOOGLE_CREDENTIALS" | base64 -d > /tmp/.credentials
cat /tmp/credentials
gcloud auth activate-service-account --key-file /tmp/.credentials
rm /tmp/.credentials
for row in $(echo "${PLUGIN_CONFIG}" | jq -r '.[] | @base64'); do
    decoded=$(echo "$row" | base64 -d)
    param=$(echo ${decoded} | jq -r 'keys[0]')
    value=$(echo ${decoded} | jq -r '.[keys[0]]')
    echo "gcloud config set $param $value"
done

echo "$PLUGIN_EXPORTS"
IFS=','
read -ra ADDR <<< "$PLUGIN_COMMANDS"
for i in "${ADDR[@]}"; do
    gcloud "$i"
done
IFS=' '