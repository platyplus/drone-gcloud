FROM google/cloud-sdk:alpine
RUN apk add --no-cache nodejs
RUN gcloud components install beta
ADD . /opt/
ENTRYPOINT ["node", "/opt/index.js"]
