#!/bin/fish

set git_v (git describe --abbrev=8 --always --dirty='*')

echo '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-'
echo -e "\033[1;34mR\033[0met 2 \033[1;31mS\033[0mhell OCI Distribution Script\n"
echo -e "Build on commit: \033[1;32m$git_v\033[0m"

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

echo -e "Building image with \033[1;32m$buildkit\033[0m"
echo -e '-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-\n'
$buildkit build --build-arg R2S_GIT_VERSION=$git_v -t ret2shell:latest -f Containerfile .
