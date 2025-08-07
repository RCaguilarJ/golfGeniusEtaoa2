$content = Get-Content -Path "style.css" -Raw
$openBraces = ($content.ToCharArray() | Where-Object { $_ -eq '{' } ).Count
$closeBraces = ($content.ToCharArray() | Where-Object { $_ -eq '}' } ).Count
Write-Host "Llaves de apertura: $openBraces, Llaves de cierre: $closeBraces, Diferencia: $($openBraces - $closeBraces)"
