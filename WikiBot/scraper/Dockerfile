FROM alpine:3.22

WORKDIR /app

RUN apk add --no-cache bash curl

COPY scrape-random-wikipedia.sh .

RUN chmod +x /app/scrape-random-wikipedia.sh

ENTRYPOINT ["/app/scrape-random-wikipedia.sh"]
