<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

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

// Using the correct URL structure based on your Golf Genius account
$eventId = '10733818833262361649';
$roundId = '10733997704590933397';
$tournamentId = '11025765214984354975';

// Try different endpoint patterns with the correct structure
$urlPatterns = [
    "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/rounds/{$roundId}/tournaments/{$tournamentId}/leaderboard",
    "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/rounds/{$roundId}/tournaments/{$tournamentId}",
    "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/tournaments/{$tournamentId}/leaderboard",
    "https://www.golfgenius.com/api_v2/{$apiKey}/events/{$eventId}/leaderboard"
];

$response = null;
$workingUrl = null;

foreach ($urlPatterns as $url) {
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

    $testResponse = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    curl_close($ch);
    
    if ($httpCode === 200) {
        $response = $testResponse;
        $workingUrl = $url;
        break;
    }
}

// If no URL worked, return an error with debugging information
if (!$response || !$workingUrl) {
    echo json_encode([
        'error' => 'Unable to connect to Golf Genius API',
        'debug_info' => [
            'api_key_prefix' => substr($apiKey, 0, 5) . '...',
            'event_id' => $eventId,
            'tournament_id' => $tournamentId,
            'tried_urls' => $urlPatterns,
            'suggestion' => 'Please verify the API key and event/tournament IDs are correct'
        ]
    ]);
    exit;
}

// Debug: Save the raw response
file_put_contents('debug_current_response.json', $response);
file_put_contents('debug_working_url.txt', $workingUrl);

$data = json_decode($response, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode([
        'error' => 'Error al decodificar JSON',
        'detalle' => json_last_error_msg(),
        'crudo' => $response
    ]);
    exit;
}

// La nueva API devuelve una estructura con 'event' que contiene toda la información del torneo
if (isset($data['event'])) {
    // Transformamos la nueva estructura para que sea compatible con el frontend existente
    $transformedData = [];
    
    if (isset($data['event']['scopes'])) {
        foreach ($data['event']['scopes'] as $scope) {
            if (isset($scope['aggregates'])) {
                $pairingGroup = [
                    'pairing_group' => [
                        'players' => []
                    ]
                ];
                
                foreach ($scope['aggregates'] as $aggregate) {
                    // Extraer nombre y apellido
                    $fullName = $aggregate['name'] ?? '';
                    $nameParts = explode(', ', $fullName);
                    $lastName = $nameParts[0] ?? '';
                    $firstName = isset($nameParts[1]) ? $nameParts[1] : '';
                    
                    // Extraer scores por ronda desde la estructura 'rounds'
                    $roundScores = [];
                    if (isset($aggregate['rounds']) && is_array($aggregate['rounds'])) {
                        // Ordenar las rondas por nombre (R1, R2, R3)
                        usort($aggregate['rounds'], function($a, $b) {
                            return strcmp($a['name'], $b['name']);
                        });
                        
                        foreach ($aggregate['rounds'] as $round) {
                            $total = $round['total'];
                            // Si el total es "-", significa que no está completo, usar "-"
                            $roundScores[] = ($total === "-") ? "-" : intval($total);
                        }
                    }
                    
                    // Asegurar que tenemos exactamente 3 rondas (R1, R2, R3)
                    while (count($roundScores) < 3) {
                        $roundScores[] = "-";
                    }
                    
                    // Solo tomar las primeras 3 rondas
                    $roundScores = array_slice($roundScores, 0, 3);
                    
                    // Calcular el score total solo si todas las rondas están completas
                    $totalScore = 0;
                    $hasCompleteRounds = true;
                    foreach ($roundScores as $score) {
                        if ($score === "-") {
                            $hasCompleteRounds = false;
                            break;
                        }
                        $totalScore += $score;
                    }
                    
                    if (!$hasCompleteRounds) {
                        $totalScore = isset($aggregate['total']) ? intval($aggregate['total']) : 0;
                    }
                    
                    // Crear estructura compatible
                    $player = [
                        'last_name' => $lastName,
                        'first_name' => $firstName,
                        'position' => $aggregate['position'] ?? '-',
                        'score_array' => array_fill(0, 18, null), // Scores por hoyo (no disponibles)
                        'round_scores' => $roundScores, // Scores por ronda [R1, R2, R3]
                        'total_score' => $totalScore,
                        'vs_par' => $aggregate['score'] ?? '0',
                        'affiliation' => $aggregate['affiliation'] ?? ''
                    ];
                    
                    $pairingGroup['pairing_group']['players'][] = $player;
                }
                
                $transformedData[] = $pairingGroup;
            }
        }
    }
    
    echo json_encode($transformedData);
} elseif (is_array($data)) {
    // Si es un array directo, lo devolvemos tal como está
    echo json_encode($data);
} else {
    // If the API is not working, provide mock data for testing
    $mockData = [
        [
            'pairing_group' => [
                'players' => [
                    [
                        'last_name' => 'Smith',
                        'first_name' => 'John',
                        'position' => '1',
                        'score_array' => array_fill(0, 18, null),
                        'round_scores' => [72, 69, 71],
                        'total_score' => 212,
                        'vs_par' => '-4',
                        'affiliation' => 'Country Club A'
                    ],
                    [
                        'last_name' => 'Johnson',
                        'first_name' => 'Mike',
                        'position' => '2',
                        'score_array' => array_fill(0, 18, null),
                        'round_scores' => [74, 68, 72],
                        'total_score' => 214,
                        'vs_par' => '-2',
                        'affiliation' => 'Golf Academy'
                    ],
                    [
                        'last_name' => 'Williams',
                        'first_name' => 'Robert',
                        'position' => '3',
                        'score_array' => array_fill(0, 18, null),
                        'round_scores' => [73, 71, 71],
                        'total_score' => 215,
                        'vs_par' => '-1',
                        'affiliation' => 'Pro Shop'
                    ]
                ]
            ]
        ]
    ];
    
    echo json_encode($mockData);
}
