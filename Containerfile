FROM alpine:3

RUN apk add --no-cache \
    bash \
    curl \
    git \
    skopeo

COPY target/x86_64-unknown-linux-musl/release/r2s-server /bin/r2s-server
RUN chmod +x /bin/r2s-server
RUN git config --global user.email platform@ret.sh.cn
RUN git config --global user.name Ret2Shell

ENTRYPOINT ["/bin/r2s-server"]
