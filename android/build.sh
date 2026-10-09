#!/usr/bin/env bash
# بناء تطبيقات الأندرويد التلاتة بدون Gradle (aapt2 + javac + d8 + apksigner)
# الاستعمال: KEYSTORE=... KS_PASS=... ./android/build.sh [admin teacher student]
set -euo pipefail
cd "$(dirname "$0")"
SDK=${ANDROID_TOOLS:-/home/user/.cache/android}
BT=$SDK/android-15; JAR=$SDK/android-35/android.jar
export JAVA_HOME=$(ls -d $SDK/jdk-17*); export PATH=$JAVA_HOME/bin:$PATH
HOST=${SITE_HOST:-quran-academy-puce.vercel.app}
VNAME=$(node -p "require('../package.json').version")
VCODE=$(echo "$VNAME" | awk -F. '{print $1*10000+$2*100+$3}')
OUT=${OUT_DIR:-/home/user/apk}
mkdir -p "$OUT"
declare -A NAME=([admin]="إدارة إتقان" [teacher]="معلمة إتقان" [student]="طالب إتقان")

for F in "${@:-admin teacher student}"; do
for F in $F; do
  echo "── $F"
  W=$(mktemp -d)
  mkdir -p $W/res/values $W/gen/sd/itqan/app $W/classes
  python3 make_icons.py $F $W/res ../public/logo.png
  cat > $W/res/values/strings.xml <<X
<?xml version="1.0" encoding="utf-8"?><resources><string name="app_name">${NAME[$F]}</string></resources>
X
  sed -e "s/@PACKAGE@/sd.itqan.$F/" -e "s/@VCODE@/$VCODE/" -e "s/@VNAME@/$VNAME/" AndroidManifest.xml > $W/AndroidManifest.xml
  cat > $W/gen/sd/itqan/app/BuildConfig.java <<X
package sd.itqan.app;
public final class BuildConfig {
  public static final String FLAVOR = "$F";
  public static final String VERSION = "$VNAME";
  public static final String HOST = "$HOST";
  public static final String START_URL = "https://$HOST/?app=$F";
}
X
  $BT/aapt2 compile --dir $W/res -o $W/res.zip
  $BT/aapt2 link -I $JAR --manifest $W/AndroidManifest.xml -o $W/base.apk $W/res.zip --min-sdk-version 24 --target-sdk-version 35
  javac -encoding UTF-8 -nowarn -Xlint:-options -source 11 -target 11 -classpath $JAR -d $W/classes src/sd/itqan/app/MainActivity.java $W/gen/sd/itqan/app/BuildConfig.java
  $BT/d8 --lib $JAR --min-api 24 --release --output $W $(find $W/classes -name '*.class')
  (cd $W && zip -q base.apk classes.dex)
  $BT/zipalign -f -p 4 $W/base.apk $W/aligned.apk
  $BT/apksigner sign --ks "$KEYSTORE" --ks-pass env:KS_PASS --ks-key-alias itqan --out "$OUT/itqan-$F-$VNAME.apk" $W/aligned.apk
  cp $W/icon-$F.png "$OUT/"
  rm -rf $W
  ls -la "$OUT/itqan-$F-$VNAME.apk"
done; done
