#!/usr/bin/env bash
set -euo pipefail

echo "Reemplazando nombres en archivos..."

find . -type f \
  ! -path "*/.git/*" \
  ! -path "*/node_modules/*" \
  ! -path "*/dist/*" \
  -print0 | while IFS= read -r -d '' file; do
  sed -i \
    -e 's/Role Harbor/Role Harbor/g' \
    -e 's/Role-Harbor/Role-Harbor/g' \
    -e 's/role-harbor/role-harbor/g' \
    "$file"
done

echo "Listo."
echo "Verificando coincidencias restantes..."
grep -Rni \
  --exclude-dir=.git \
  --exclude-dir=node_modules \
  --exclude-dir=dist \
  "Role Harbor\|Role-Harbor\|role-harbor" . || true
