# Script pour corriger TOUS les imports dans compta-app
$rootPath = "."

# Obtenir tous les fichiers TypeScript et TSX dans compta-app
$files = Get-ChildItem -Path "$rootPath\compta-app" -Include "*.ts","*.tsx" -Recurse

Write-Host "Found $($files.Count) files to process" -ForegroundColor Cyan

foreach ($file in $files) {
    $content = Get-Content $file.FullName | Out-String
    $modified = $false
    
    # Remplacements pour les imports dans compta-app
    # Les imports @/lib et @/types restent tels quels car ils sont dans le root
    # Les imports @/components et @/contexts doivent pointer vers @/compta-app
    
    # Pattern 1: @/components -> @/compta-app/components
    if ($content -match "from ['`"]@/components/") {
        $content = $content -replace "from ['`"]@/components/", "from '@/compta-app/components/"
        $modified = $true
    }
    
    # Pattern 2: @/contexts -> @/compta-app/contexts  
    if ($content -match "from ['`"]@/contexts/") {
        $content = $content -replace "from ['`"]@/contexts/", "from '@/compta-app/contexts/"
        $modified = $true
    }
    
    if ($modified) {
        # Écrire le contenu modifié
        $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
    }
}

Write-Host "Import fixing completed!" -ForegroundColor Cyan
