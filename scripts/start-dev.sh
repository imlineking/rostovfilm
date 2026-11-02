#!/bin/sh
# Dev-сервер с российским CA Минцифры (нужно для API MAX platform-api2.max.ru)
cd "$(dirname "$0")/.." || exit 1
NODE_EXTRA_CA_CERTS="$PWD/certs/russian-trusted-ca.pem" exec bun run dev
