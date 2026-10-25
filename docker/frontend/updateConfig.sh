#!/bin/sh
cd /usr/share/nginx/html || exit 1

echo "replace firebase config appid: ${FIREBASE_APPID}"
for file in js/firebase-config-live.*.js; do
  [ -f "$file" ] || continue
  sed -i "s|###FIREBASE_APIKEY###|${FIREBASE_APIKEY}|g" "$file"
  sed -i "s|###FIREBASE_AUTHDOMAIN###|${FIREBASE_AUTHDOMAIN}|g" "$file"
  sed -i "s|###FIREBASE_PROJECTID###|${FIREBASE_PROJECTID}|g" "$file"
  sed -i "s|###FIREBASE_STORAGEBUCKET###|${FIREBASE_STORAGEBUCKET}|g" "$file"
  sed -i "s|###FIREBASE_MESSAGINGSENDERID###|${FIREBASE_MESSAGINGSENDERID}|g" "$file"
  sed -i "s|###FIREBASE_APPID###|${FIREBASE_APPID}|g" "$file"
done

echo "use backend url ${MONKEYTYPE_BACKENDURL}"
for file in js/*.js; do
  [ -f "$file" ] || continue
  sed -i "s|###MONKEYTYPE_BACKENDURL###|${MONKEYTYPE_BACKENDURL}|g" "$file"
  sed -i "s|###RECAPTCHA_SITE_KEY###|${RECAPTCHA_SITE_KEY}|g" "$file"
done
