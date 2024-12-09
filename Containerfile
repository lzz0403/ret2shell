FROM rust:1-alpine as builder

# hadolint ignore=DL3018
RUN apk add --update --no-cache musl-dev

ARG R2S_GIT_VERSION=DEADBEEF
ENV R2S_GIT_VERSION=${R2S_GIT_VERSION}

COPY ./config /var/lib/ret2shell/config
COPY ./Cargo.toml /var/lib/ret2shell/Cargo.toml
COPY ./crates /var/lib/ret2shell/crates
WORKDIR /var/lib/ret2shell

RUN cargo build --release --target x86_64-unknown-linux-musl

FROM alpine:3

# hadolint ignore=DL3018
RUN apk add --update --no-cache curl git skopeo && \
    git config --global user.email platform@ret.sh.cn && \
    git config --global user.name Ret2Shell

COPY --from=builder /var/lib/ret2shell/target/x86_64-unknown-linux-musl/release/r2s-server /bin/r2s-server

ENTRYPOINT ["/bin/r2s-server"]

