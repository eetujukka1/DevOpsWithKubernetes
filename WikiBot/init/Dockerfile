FROM alpine:3.22

WORKDIR /app

RUN apk add --no-cache bash curl

COPY init-wikipedia.sh .

RUN chmod +x /app/init-wikipedia.sh

ENTRYPOINT ["/app/init-wikipedia.sh"]
