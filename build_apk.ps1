$ErrorActionPreference = "Stop"
$workspace = $PSScriptRoot
if (-not $workspace) { $workspace = Split-Path -Parent $MyInvocation.MyCommand.Path }
if (-not $workspace) { $workspace = Get-Location }
$tempBuild = "F:\app_build"

Write-Host "==> [1/11] Setting up build staging at $tempBuild..."
if (Test-Path $tempBuild) { Remove-Item $tempBuild -Recurse -Force }
New-Item -ItemType Directory -Path "$tempBuild\src\main\res" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempBuild\src\main\assets" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempBuild\src\main\java\com\minimal\timetable" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempBuild\gen" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempBuild\compiled_res" -Force | Out-Null
New-Item -ItemType Directory -Path "$tempBuild\classes" -Force | Out-Null

Write-Host "==> [2/11] Copying project files..."
Copy-Item "$workspace\index.html" "$tempBuild\src\main\assets\index.html" -Force
Copy-Item "$workspace\style.css" "$tempBuild\src\main\assets\style.css" -Force
Copy-Item "$workspace\app.js" "$tempBuild\src\main\assets\app.js" -Force
Copy-Item "$workspace\manifest.json" "$tempBuild\src\main\assets\manifest.json" -Force
Copy-Item "$workspace\icon.svg" "$tempBuild\src\main\assets\icon.svg" -Force

Copy-Item "$workspace\android\app\src\main\AndroidManifest.xml" "$tempBuild\src\main\AndroidManifest.xml" -Force
Copy-Item "$workspace\android\app\src\main\res\*" "$tempBuild\src\main\res" -Recurse -Force
Copy-Item "$workspace\android\app\src\main\java\com\minimal\timetable\MainActivity.java" "$tempBuild\src\main\java\com\minimal\timetable\MainActivity.java" -Force

$javaHome = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$javac = "$javaHome\bin\javac.exe"
$keytool = "$javaHome\bin\keytool.exe"
$jar = "$javaHome\bin\jar.exe"

$sdkDir = "F:\Android\Sdk"
$buildTools = "$sdkDir\build-tools\34.0.0"
$aapt2 = "$buildTools\aapt2.exe"
$d8 = "$buildTools\d8.bat"
$zipalign = "$buildTools\zipalign.exe"
$apksigner = "$buildTools\apksigner.bat"
$androidJar = "$sdkDir\platforms\android-34\android.jar"

$manifestPath = "$tempBuild\src\main\AndroidManifest.xml"
$resDir = "$tempBuild\src\main\res"
$assetsDir = "$tempBuild\src\main\assets"
$genDir = "$tempBuild\gen"
$compiledResDir = "$tempBuild\compiled_res"
$classesDir = "$tempBuild\classes"

Write-Host "==> [3/11] Compiling Android resources with AAPT2..."
& $aapt2 compile --dir $resDir -o "$compiledResDir\res.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 compile failed" }

Write-Host "==> [4/11] Linking resources and generating base APK..."
$unalignedApk = "$tempBuild\app-unaligned.apk"
& $aapt2 link `
    -I $androidJar `
    --manifest $manifestPath `
    -A $assetsDir `
    --auto-add-overlay `
    --java $genDir `
    -o $unalignedApk `
    "$compiledResDir\res.zip"
if ($LASTEXITCODE -ne 0) { throw "aapt2 link failed" }

Write-Host "==> [5/11] Compiling Java sources with javac..."
$javaFiles = @(
    Get-ChildItem -Path "$tempBuild\src\main\java" -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
    Get-ChildItem -Path $genDir -Filter "*.java" -Recurse | Select-Object -ExpandProperty FullName
)
& $javac -encoding UTF-8 -cp $androidJar -d $classesDir $javaFiles
if ($LASTEXITCODE -ne 0) { throw "javac compilation failed" }

Write-Host "==> [6/11] Dexing bytecode with D8..."
$classFiles = Get-ChildItem -Path $classesDir -Filter "*.class" -Recurse | Select-Object -ExpandProperty FullName
$env:JAVA_HOME = $javaHome
& $d8 --output $tempBuild --lib $androidJar $classFiles
if ($LASTEXITCODE -ne 0) { throw "d8 failed" }

Write-Host "==> [7/11] Injecting classes.dex into APK..."
Push-Location $tempBuild
& $jar -uf "$unalignedApk" "classes.dex"
if ($LASTEXITCODE -ne 0) { throw "jar -uf failed" }
Pop-Location

Write-Host "==> [8/11] Aligning APK with zipalign..."
$alignedApk = "$tempBuild\app-aligned.apk"
& $zipalign -p -f 4 $unalignedApk $alignedApk
if ($LASTEXITCODE -ne 0) { throw "zipalign failed" }

Write-Host "==> [9/11] Signing APK..."
$keystore = "$workspace\android\debug.keystore"
if (-not (Test-Path $keystore)) {
    & $keytool -genkeypair -v `
        -keystore $keystore `
        -storepass android `
        -alias androiddebugkey `
        -keypass android `
        -keyalg RSA `
        -keysize 2048 `
        -validity 10000 `
        -dname "CN=Android Debug,O=Android,C=US"
}

$signedApk = "$tempBuild\app-signed.apk"
& $apksigner sign `
    --ks $keystore `
    --ks-pass pass:android `
    --ks-key-alias androiddebugkey `
    --key-pass pass:android `
    --out $signedApk `
    $alignedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner failed" }

Write-Host "==> [10/11] Verifying APK signature..."
& $apksigner verify -v $signedApk
if ($LASTEXITCODE -ne 0) { throw "apksigner verification failed" }

Write-Host "==> [11/11] Outputting APK to workspace..."
$apkEn = "$workspace\minimal_timetable.apk"
$apkDemo = "$workspace\极简课表_示例版.apk"
$apkClean = "$workspace\极简课表.apk"
Copy-Item $signedApk $apkEn -Force
Copy-Item $signedApk $apkDemo -Force
Copy-Item $signedApk $apkClean -Force

$item = Get-Item $apkDemo
Write-Host "=================================================="
Write-Host "SUCCESS: DEMO APK BUILT AND SIGNED!"
Write-Host "Path 1: $apkDemo"
Write-Host "Path 2: $apkClean"
Write-Host "Path 3: $apkEn"
Write-Host "Size  : $([math]::Round($item.Length / 1KB, 2)) KB"
Write-Host "=================================================="
