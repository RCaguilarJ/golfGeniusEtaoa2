<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 🔐 Parámetros del torneo
$round_id = $_GET['round_id'] ?? null;
$event_id = "10733818833262361649";
$tournament_id = "11025765214984354975";
$token = "MGMlbTG_APORWozDtgXHdQ";

// ⛔ Validación básica
if (!$round_id) {
  echo json_encode(['error' => 'Falta el parámetro round_id']);
  exit;
}

// 🌐 Construir URL de la API
$url = "https://www.golfgenius.com/api_v2/$token/events/$event_id/rounds/$round_id/tournaments/$tournament_id";

// 🔄 Obtener datos desde Golf Genius
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(['error' => curl_error($ch)]);
  exit;
}
curl_close($ch);

$data = json_decode($response, true);

// 📦 Preparar lista de jugadores
$players = [];

if (isset($data['event']['scopes'][0]['aggregates'])) {
  foreach ($data['event']['scopes'][0]['aggregates'] as $aggregate) {
    // ✂️ Separar nombre
    $nameParts = explode(', ', $aggregate['name'] ?? '');
    $last = $nameParts[0] ?? '';
    $first = $nameParts[1] ?? '';

    // 📌 Datos clave
    $position = $aggregate['position'] ?? '-';
    $vs_par = $aggregate['score'] ?? '-'; // UNDER
    $hole_scores = $aggregate['gross_scores'] ?? array_fill(0, 18, '-'); // HOLES
    $total_score = $aggregate['totals']['net_scores']['total'] ?? '-';   // TOTAL

    $players[] = [
      'first_name' => $first,
      'last_name' => $last,
      'position' => $position,
      'vs_par' => $vs_par,
      'round_score' => $total_score,
      'round_hole_scores' => $hole_scores
    ];
  }
}

// 🚀 Devolver respuesta JSON
echo json_encode(['players' => $players]);