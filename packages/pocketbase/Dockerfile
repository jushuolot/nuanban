# 官方 PocketBase 二进制，本地 HTTP 8090，无强制跳转 HTTPS
FROM alpine:3.20

ARG PB_VERSION=0.38.2
ARG TARGETARCH=amd64

RUN apk add --no-cache ca-certificates unzip wget \
  && wget -q "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" -O /tmp/pb.zip \
  && unzip /tmp/pb.zip -d /pb \
  && rm /tmp/pb.zip

EXPOSE 8090

CMD ["/pb/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/pb_public", "--hooksDir=/pb_hooks", "--origins=http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174"]
