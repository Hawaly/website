# Script pour corriger les guillemets mal assortis dans compta-app
$files = Get-ChildItem -Path ".\compta-app" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8
        $modified = $false
        
        # Corriger les patterns de guillemets mal assortis: '@/...";
        if ($content -match "from\s+'@/[^`"]+`";") {
            $content = $content -replace "from\s+'(@/[^`"]+)`";", 'from "$1";'
            $modified = $true
        }
        
        if ($modified) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error processing: $($file.FullName) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Quote fixing completed!" -ForegroundColor Cyan
