FROM google/cloud-sdk:alpine
RUN apk add --no-cache nodejs gettext
# RUN apk add --no-cache jq gettext
RUN gcloud components install beta
# ADD script.sh /bin/
ADD index.js /opt/
# RUN chmod +x /bin/script.sh
ENTRYPOINT ["node", "/opt/index.js"]
