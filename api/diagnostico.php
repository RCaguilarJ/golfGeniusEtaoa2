<?php
echo "=== DIAGNÓSTICO DE API GOLF GENIUS ===\n\n";

// 1. Verificar .env
$envFile = '../.env';
echo "1. Verificando archivo .env...\n";
if (file_exists($envFile)) {
    echo "✅ Archivo .env encontrado\n";
    $envContent = file_get_contents($envFile);
    echo "Contenido: " . $envContent . "\n";
    
    if (preg_match('/API_KEY=(.+)/', $envContent, $matches)) {
        $apiKey = trim($matches[1]);
        echo "✅ API Key extraída: " . substr($apiKey, 0, 5) . "...\n";
    } else {
        echo "❌ No se pudo extraer API Key\n";
        exit;
    }
} else {
    echo "❌ Archivo .env no encontrado\n";
    exit;
}

echo "\n2. Probando diferentes URLs...\n";

$eventId = '10733818833262361649';
$roundId = '10733997704590933397';
$tournamentId = '11025765214984354975';

$testUrls = [
    "Tournaments con Round" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/rounds/{$roundId}/tournaments/{$tournamentId}",
    "Leaderboard con Round" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/rounds/{$roundId}/tournaments/{$tournamentId}/leaderboard",
    "Solo Tournament" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}",
    "Leaderboard sin Round" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}/leaderboard",
    "Lista Tournaments" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/rounds/{$roundId}/tournaments/",
    "Solo Evento" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}",
    "Lista Eventos" => "https://www.golfgenius.com/api_v2/{$apiKey}/events"
];

foreach ($testUrls as $name => $url) {
    echo "\nProbando: {$name}\n";
    echo "URL: {$url}\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'User-Agent: Golf-Leaderboard-App/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    if ($curlError) {
        echo "❌ Error CURL: {$curlError}\n";
    } else {
        echo "HTTP Code: {$httpCode}\n";
        
        if ($httpCode === 200) {
            echo "✅ ¡ÉXITO! Respuesta válida\n";
            echo "Primeros 200 caracteres: " . substr($response, 0, 200) . "...\n";
            
            // Guardar respuesta exitosa
            file_put_contents("debug_success_{$name}.json", $response);
        } else {
            echo "❌ Error HTTP {$httpCode}\n";
            
            // Verificar si es HTML (error 404)
            if (strpos($response, '<!doctype html>') !== false || strpos($response, '<html') !== false) {
                echo "Respuesta es HTML (página de error)\n";
            } else {
                echo "Primeros 200 caracteres: " . substr($response, 0, 200) . "...\n";
            }
        }
    }
    
    curl_close($ch);
    echo "---\n";
}

echo "\n=== RECOMENDACIONES ===\n";
echo "Si todas las URLs fallan:\n";
echo "1. Verificar que la API Key sea correcta\n";
echo "2. Verificar los IDs del evento y torneo\n";
echo "3. Contactar soporte de Golf Genius para confirmar la URL del API\n";
echo "4. Verificar que el evento esté activo y público\n";
?>
