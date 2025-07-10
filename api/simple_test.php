<?php
echo "PHP Script Starting...\n";

// Load environment variables
$envFile = '../.env';
echo "Looking for .env file at: " . realpath($envFile) . "\n";

if (file_exists($envFile)) {
    echo ".env file found!\n";
    $envContent = file_get_contents($envFile);
    echo "File content: " . $envContent . "\n";
    
    if (preg_match('/API_KEY=(.+)/', $envContent, $matches)) {
        $apiKey = trim($matches[1]);
        echo "API Key extracted: " . substr($apiKey, 0, 5) . "...\n";
    } else {
        echo "Could not extract API key from .env\n";
        exit;
    }
} else {
    echo ".env file not found!\n";
    exit;
}

// Test simple URL
$url = "https://www.golfgenius.com/api_v2/{$apiKey}/events/10733818833262361649/tournaments/11025765214984354975/leaderboard";
echo "Testing URL: {$url}\n";

echo "Initializing CURL...\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
curl_setopt($ch, CURLOPT_TIMEOUT, 10);

echo "Making request...\n";
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);

echo "Response received.\n";
echo "HTTP Code: {$httpCode}\n";

if ($curlError) {
    echo "CURL Error: {$curlError}\n";
} else {
    echo "Response length: " . strlen($response) . "\n";
    echo "Response sample: " . substr($response, 0, 200) . "\n";
}

curl_close($ch);
echo "Script complete.\n";
?>
