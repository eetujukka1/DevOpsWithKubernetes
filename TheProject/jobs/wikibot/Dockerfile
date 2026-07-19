FROM alpine:3.22

WORKDIR /app

RUN apk add --no-cache curl

COPY random-wikipedia.sh .

RUN chmod +x /app/random-wikipedia.sh

ENTRYPOINT ["sh", "/app/random-wikipedia.sh"]
