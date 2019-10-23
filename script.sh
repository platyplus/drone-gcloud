#!/bin/sh
# TODO activate set -e

# * Authentication
env
echo "${CREDENTIALS}" | base64 -d > .credentials
echo "${PLUGIN_CREDENTIALS}" | base64 -d > .credentials2
ls -la
cat .credentials
gcloud auth activate-service-account --key-file .credentials
gcloud auth activate-service-account --key-file .credentials2
rm .credentials

echo "$PLUGIN_t1"
echo "$PLUGIN_t2"
echo "$PLUGIN_t3"
echo "$PLUGIN_t4"
# * Set configuration
# TODO test if empty env variable
for row in $(echo "${PLUGIN_CONFIG}" | jq -r '.[] | @base64'); do
    decoded=$(echo "$row" | base64 -d)
    param=$(echo ${decoded} | jq -r 'keys[0]')
    value=$(echo ${decoded} | jq -r '.[keys[0]]')
    gcloud config set $param $value
done

# * Set possible environment variables from gcloud calls
echo "${PLUGIN_COMMANDS}"
# for row in $(echo "${PLUGIN_EXPORTS}" | jq -r '.[] | @base64'); do
#     decoded=$(echo "$row" | base64 -d)
#     param=$(echo ${decoded} | jq -r 'keys[0]')
#     value=$(echo ${decoded} | jq -r '.[keys[0]]')
#     export ${param}=$(gcloud ${value})
# done
for row in $(echo "${PLUGIN_COMMANDS}" | jq -r '.[] | @base64'); do
    decoded=$(echo "$row" | base64 -d)
    if echo "$decoded" | jq -e . >/dev/null 2>&1; then
        param=$(echo ${decoded} | jq -r 'keys[0]')
        value=$(echo ${decoded} | jq -r '.[keys[0]]')
        export $param="$(gcloud $value)"
    else
        gcloud $decoded
    fi
done

# IFS=','
# read -ra ADDR <<< "$PLUGIN_COMMANDS"
# for i in "${ADDR[@]}"; do
#     gcloud "$i"
# done
# IFS=' '