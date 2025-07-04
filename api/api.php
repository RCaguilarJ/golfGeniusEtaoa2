<?php
// api/api.php

header('Content-Type: application/json');

// URL base (puedes mover esto a un archivo .env si lo deseas)
$url = 'https://www.golfgenius.com/api_v2/MGMlbTG_APORWozDtgXHdQ/events/10733818833262361649/rounds/10733997704590933397/tee_sheet?include_all_custom_fields=include_all_custom_fields';

// Usa cURL para consumir la API externa
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
    exit;
}

curl_close($ch);
echo $response;
