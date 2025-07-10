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

// Test different base URLs and approaches
$tests = [
    [
        'name' => 'Current URL Structure',
        'url' => "https://www.golfgenius.com/api_v2/{$apiKey}/events/10733818833262361649/tournaments/11025765214984354975/leaderboard"
    ],
    [
        'name' => 'Alternative base URL',
        'url' => "https://api.golfgenius.com/v2/{$apiKey}/events/10733818833262361649/tournaments/11025765214984354975/leaderboard"
    ],
    [
        'name' => 'With Authorization Header',
        'url' => "https://www.golfgenius.com/api_v2/events/10733818833262361649/tournaments/11025765214984354975/leaderboard",
        'auth_header' => true
    ],
    [
        'name' => 'Different Event ID format',
        'url' => "https://www.golfgenius.com/api_v2/{$apiKey}/events/10733818833262361649/leaderboard"
    ]
];

foreach ($tests as $test) {
    echo "\n=== Testing: {$test['name']} ===\n";
    echo "URL: {$test['url']}\n";
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $test['url']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $headers = [
        'Accept: application/json',
        'User-Agent: Golf-Leaderboard-App/1.0'
    ];
    
    if (isset($test['auth_header']) && $test['auth_header']) {
        $headers[] = "Authorization: Bearer {$apiKey}";
        $headers[] = "X-API-Key: {$apiKey}";
    }
    
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    
    if ($curlError) {
        echo "CURL Error: {$curlError}\n";
    } else {
        echo "HTTP Code: {$httpCode}\n";
        if ($httpCode === 200) {
            echo "SUCCESS!\n";
            echo "Response sample: " . substr($response, 0, 300) . "...\n";
            file_put_contents("debug_success_response.json", $response);
        } else {
            echo "Error response sample: " . substr($response, 0, 300) . "...\n";
        }
    }
    
    curl_close($ch);
    echo "\n";
}

// Also try to see if we can get events list
echo "\n=== Testing Events List ===\n";
$eventsUrl = "https://www.golfgenius.com/api_v2/{$apiKey}/events";
echo "URL: {$eventsUrl}\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $eventsUrl);
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
        echo "Events list retrieved successfully!\n";
        echo "Response sample: " . substr($response, 0, 500) . "...\n";
        file_put_contents("debug_events_response.json", $response);
    } else {
        echo "Events error response: " . substr($response, 0, 300) . "...\n";
    }
}

curl_close($ch);
?>
