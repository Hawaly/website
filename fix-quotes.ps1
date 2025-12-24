# Script pour corriger les guillemets mal assortis
$files = Get-ChildItem -Path ".\src" -Include "*.tsx","*.ts" -Recurse

foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Encoding UTF8 | Out-String
        $modified = $false
        
        # Corriger les patterns de guillemets mal assortis
        if ($content -match "'@/[^']+`"") {
            $content = $content -replace "'(@/[^`"]+)`"", '''$1'''
            $modified = $true
        }
        
        if ($modified) {
            $content | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            Write-Host "Fixed: $($file.FullName)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Error processing: $($file.FullName)" -ForegroundColor Red
    }
}

Write-Host "Quote fixing completed!" -ForegroundColor Cyan
