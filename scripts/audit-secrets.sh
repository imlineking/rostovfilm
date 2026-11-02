#!/bin/sh
# Аудит секретов перед публичным push: значения из .env.local не должны
# встречаться ни в одном коммите истории, а чувствительные файлы — отслеживаться.
cd "$(dirname "$0")/.." || exit 1
fail=0

values=$(sed -n 's/^\(STUDIO_SMTP_PASS\|MAX_BOT_TOKEN\|STUDIO_CAPTCHA_SECRET\)=\(.\+\)$/\2/p' .env.local)
for v in $values; do
  if git grep -qF "$v" $(git rev-list --all) 2>/dev/null; then
    echo "УТЕЧКА: секрет из .env.local найден в истории git!"
    fail=1
  else
    echo "ok: секрет отсутствует в истории"
  fi
done

leaked_files=$(git ls-files | grep -E "(^|/)\.env\.local$|^dev\.log$|(^|/)custom\.db$" || true)
if [ -n "$leaked_files" ]; then
  echo "ОТСЛЕЖИВАЮТСЯ чувствительные файлы: $leaked_files"
  fail=1
else
  echo "ok: .env.local / dev.log / custom.db не отслеживаются"
fi

if [ "$fail" = "0" ]; then echo "АУДИТ ПРОЙДЕН"; else echo "АУДИТ ПРОВАЛЕН"; fi
exit $fail
