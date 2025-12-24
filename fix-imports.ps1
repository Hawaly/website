# Script pour corriger les imports dans compta-app
$comptaAppPath = ".\compta-app"

# Patterns de remplacement
$replacements = @{
    "from '@/lib/" = "from '@/lib/"
    "from '@/types/" = "from '@/types/"
    "from '@/contexts/" = "from '@/compta-app/contexts/"
    "from '@/components/" = "from '@/compta-app/components/"
}

# Obtenir tous les fichiers TypeScript et TSX
$files = Get-ChildItem -Path $comptaAppPath -Include "*.ts","*.tsx" -Recurse

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $modified = $false
    
    foreach ($pattern in $replacements.Keys) {
        if ($content -match [regex]::Escape($pattern)) {
            $content = $content -replace [regex]::Escape($pattern), $replacements[$pattern]
            $modified = $true
        }
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed imports in: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Import fixing completed!" -ForegroundColor Cyan
