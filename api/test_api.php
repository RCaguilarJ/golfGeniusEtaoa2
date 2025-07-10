<?php
header('Content-Type: application/json');

// Load environment variables
$envFile = '../.env';
$apiKey = '';

if (file_exists($envFile)) {
    $envContent = file_get_contents($envFile);
    if (preg_match('/API_KEY=(.+)/', $envContent, $matches)) {
        $apiKey = trim($matches[1]);
    }
}

if (empty($apiKey)) {
    echo json_encode(['error' => 'API Key not found in .env file']);
    exit;
}

// Test different endpoints
$eventId = '10733818833262361649';
$tournamentId = '11025765214984354975';

$endpoints = [
    "leaderboard" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}/leaderboard",
    "event" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}",
    "tournament" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}",
    "scorecards" => "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}/scorecards",
];

foreach ($endpoints as $name => $url) {
    echo "Testing {$name}: {$url}\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Accept: application/json',
        'User-Agent: Golf-Leaderboard-App/1.0'
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if (curl_errno($ch)) {
        echo "CURL Error: " . curl_error($ch) . "\n";
    } else {
        echo "HTTP Code: {$httpCode}\n";
        if ($httpCode === 200) {
            echo "SUCCESS! Response: " . substr($response, 0, 200) . "...\n";
            file_put_contents("debug_{$name}_response.json", $response);
        } else {
            echo "Error response: " . substr($response, 0, 200) . "...\n";
        }
    }
    
    curl_close($ch);
    echo "\n---\n";
}
?>
