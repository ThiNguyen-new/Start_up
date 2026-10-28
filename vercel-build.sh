#!/bin/bash
set -e

NODE_VERSION='22.23.4'
GO_VERSION='1.23.4'
HUGO_VERSION='0.163.3'

echo "=== USING NODE VERSION: $(node -v) ==="

# Install Go
echo "=== Installing Go $GO_VERSION... ==="
curl -sSOL https://dl.google.com/go/go${GO_VERSION}.linux-amd64.tar.gz
tar -C /usr/local -xzf go${GO_VERSION}.linux-amd64.tar.gz
export PATH=$PATH:/usr/local/go/bin
rm -rf go${GO_VERSION}.linux-amd64.tar.gz
go version

# Install Hugo Extended
echo "=== Installing Hugo Extended $HUGO_VERSION... ==="
curl -sSOL https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
tar -xzf hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
mv hugo /usr/local/bin/
rm -rf hugo_extended_${HUGO_VERSION}_linux-amd64.tar.gz
hugo version

# Install dependencies with pnpm
echo "=== Installing project dependencies with pnpm... ==="
corepack enable
pnpm install --frozen-lockfile || pnpm install

# Run build
echo "=== Running production build... ==="
pnpm run build
echo "=== Build Complete! Output directory: public/ ==="
