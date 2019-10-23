FROM google/cloud-sdk:alpine
RUN apk add --no-cache jq gettext
RUN gcloud components install beta
ADD script.sh /bin/
RUN chmod +x /bin/script.sh
ENTRYPOINT /bin/script.sh
