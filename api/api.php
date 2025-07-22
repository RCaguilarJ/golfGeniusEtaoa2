<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// 🔐 Parámetros fijos del torneo
$round_id = $_GET['round_id'] ?? null;
$event_id = "10733818833262361649";
$tournament_id = "11025765214984354975";
$token = "MGMlbTG_APORWozDtgXHdQ";

// ⛔ Validar entrada
if (!$round_id) {
  echo json_encode(['error' => 'Falta el parámetro round_id']);
  exit;
}

// 🌐 Construir URL real hacia Golf Genius
$url = "https://www.golfgenius.com/api_v2/$token/events/$event_id/rounds/$round_id/tournaments/$tournament_id";

// 🔄 Petición con cURL
$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // 👈 Solo en entorno local
$response = curl_exec($ch);


 //URL PROD.
// cURL para llamada segura
// $ch = curl_init($url);
// curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// $response = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(['error' => curl_error($ch)]);
  exit;
}

curl_close($ch);
$data = json_decode($response, true);

// 🧩 Procesar jugadores
$players = [];

if (isset($data['event']['scopes'][0]['aggregates'])) {
  foreach ($data['event']['scopes'][0]['aggregates'] as $aggregate) {
    $nameParts = explode(', ', $aggregate['name']);
    $last = $nameParts[0] ?? '';
    $first = $nameParts[1] ?? '';
    $position = $aggregate['position'] ?? '-';

    // Buscar datos específicos de la ronda actual
    $ronda = array_filter($aggregate['rounds'] ?? [], fn($r) => $r['id'] == $round_id);
    $ronda = array_values($ronda)[0] ?? [];

    // ✅ Corrección: UNDER → 'score', TOTAL → 'total'
    $vs_par = $ronda['score'] ?? '-';       // Ej. "+4"
    $total_score = $ronda['total'] ?? '-';  // Ej. "76"

    // HOLES 1–18
    $hole_scores = $aggregate['gross_scores'] ?? [];

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

// 🔚 Devolver estructura compatible con script.js
echo json_encode(['players' => $players]);
