<?php
// Cargar .env
$dotenv = parse_ini_file(__DIR__ . '/../.env');

$apiKey = $dotenv['API_KEY'];
$eventId = '10733818833262361649';
$roundId = '10733997704590933397';

$url = "https://www.golfgenius.com/api_v2/$apiKey/events/$eventId/rounds/$roundId/tee_sheet?include_all_custom_fields=include_all_custom_fields";

// Realiza la solicitud a la API
$options = [
    "http" => [
        "method" => "GET",
        "header" => "Accept: application/json"
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    http_response_code(500);
    echo json_encode(["error" => "No se pudo obtener la información de la API."]);
    exit;
}

header('Content-Type: application/json');
echo $response;
