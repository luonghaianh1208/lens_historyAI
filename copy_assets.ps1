$source = "C:\Users\ADMIN\.gemini\antigravity\brain\b453a240-164d-4440-8680-284d98af98e4"
$destBg = "c:\Users\ADMIN\Downloads\VIBE CODING\Lens_HistoryAI\public\assets\backgrounds"
$destChar = "c:\Users\ADMIN\Downloads\VIBE CODING\Lens_HistoryAI\public\assets\characters"

If (!(Test-Path $destBg)) { New-Item -ItemType Directory -Force -Path $destBg | Out-Null }
If (!(Test-Path $destChar)) { New-Item -ItemType Directory -Force -Path $destChar | Out-Null }

Get-ChildItem -Path $source -Filter "bg_*.png" | ForEach-Object {
    $newName = $_.Name -replace "_\d{13}\.png", ".webp"
    Copy-Item -Path $_.FullName -Destination (Join-Path $destBg $newName) -Force
}

Get-ChildItem -Path $source -Filter "char_*.png" | ForEach-Object {
    $newName = $_.Name -replace "_\d{13}\.png", ".webp"
    Copy-Item -Path $_.FullName -Destination (Join-Path $destChar $newName) -Force
}

Write-Host "Assets copied and renamed."
