FROM google/cloud-sdk:alpine
ADD script.sh /bin/
RUN gcloud components install beta
RUN chmod +x /bin/script.sh
ENTRYPOINT /bin/script.sh
