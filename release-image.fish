#!/bin/fish

set git_v (git describe --abbrev=8 --always --dirty='*')

if command -q docker
    set buildkit docker
else if command -q podman
    set buildkit podman
else if command -q buildah
    set buildkit buildah
else
    echo "No image buildkit found"
    exit 1
end

$buildkit build --build-arg R2S_GIT_VERSION=$git_v -t ret2shell:latest -f Containerfile .
