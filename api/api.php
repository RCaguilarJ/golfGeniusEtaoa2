<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$raw = file_get_contents(__DIR__ . '/debug_current_response.json'); // o reemplaza con tu curl
$data = json_decode($raw, true);

$players = [];

if (isset($data['event']['scopes'])) {
  foreach ($data['event']['scopes'] as $scope) {
    foreach ($scope['aggregates'] as $aggregate) {
      $nameParts = explode(', ', $aggregate['name']);
      $last = $nameParts[0] ?? '';
      $first = $nameParts[1] ?? '';
      $vs_par = $aggregate['score'] ?? '0';
      $total_score = $aggregate['total'] ?? '-';
      $position = $aggregate['position'] ?? '-';
      $rounds = $aggregate['rounds'] ?? [];

      $round_scores = [];
      foreach ($rounds as $r) {
        $round_scores[] = $r['total'] ?? "-";
      }

      $hole_scores = [];
      if (isset($aggregate['gross_scores'])) {
        $hole_scores[] = $aggregate['gross_scores'];
      }

      if (isset($aggregate['previous_rounds_scores'])) {
        foreach ($aggregate['previous_rounds_scores'] as $prs) {
          $hole_scores[] = $prs['gross_scores'];
        }
      }

      while (count($hole_scores) < 3) $hole_scores[] = [];

      $players[] = [
        'first_name' => $first,
        'last_name' => $last,
        'position' => $position,
        'vs_par' => $vs_par,
        'total_score' => $total_score,
        'round_scores' => $round_scores,
        'round_hole_scores' => $hole_scores
      ];
    }
  }
}

echo json_encode($players);