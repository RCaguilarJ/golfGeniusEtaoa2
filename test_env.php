<?php
header('Content-Type: application/json');

echo "=== ENV FILE TEST ===\n";
$envFile = '.env';

echo "1. File exists: " . (file_exists($envFile) ? 'YES' : 'NO') . "\n";
echo "2. File path: " . realpath($envFile) . "\n";

if (file_exists($envFile)) {
    $content = file_get_contents($envFile);
    echo "3. Raw content: " . json_encode($content) . "\n";
    echo "4. Content length: " . strlen($content) . "\n";
    
    // Try parse_ini_file
    $iniData = parse_ini_file($envFile);
    echo "5. parse_ini_file result: " . json_encode($iniData) . "\n";
    
    // Try regex
    if (preg_match('/API_KEY\s*=\s*(.+?)[\r\n]*$/m', $content, $matches)) {
        echo "6. Regex match: " . json_encode($matches[1]) . "\n";
    } else {
        echo "6. Regex: NO MATCH\n";
    }
    
    // Try simple split
    $lines = explode("\n", $content);
    foreach ($lines as $line) {
        if (strpos($line, 'API_KEY=') === 0) {
            $key = substr($line, 8);
            echo "7. Split method: " . json_encode(trim($key)) . "\n";
        }
    }
}
?>
