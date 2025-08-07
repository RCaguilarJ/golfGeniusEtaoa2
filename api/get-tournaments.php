<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$event_id = $_GET['event_id'] ?? null;
$round_id = $_GET['round_id'] ?? null;

if (!$event_id) {
    echo json_encode(['error' => 'Falta el parámetro event_id']);
    exit;
}

try {
    // 🏆 Obtener todos los torneos para un evento específico (y ronda si se proporciona)
    if ($round_id) {
        $stmt = $pdo->prepare("SELECT DISTINCT tournament_id FROM api_config WHERE event_id = ? AND round_id = ? AND tournament_id IS NOT NULL ORDER BY created_at ASC");
        $stmt->execute([$event_id, $round_id]);
    } else {
        $stmt = $pdo->prepare("SELECT DISTINCT tournament_id FROM api_config WHERE event_id = ? AND tournament_id IS NOT NULL ORDER BY created_at ASC");
        $stmt->execute([$event_id]);
    }
    
    $tournaments = $stmt->fetchAll();
    
    $tournamentsList = [];
    foreach ($tournaments as $tournament) {
        $tournamentsList[] = [
            'tournament_id' => $tournament['tournament_id']
        ];
    }
    
    echo json_encode(['tournaments' => $tournamentsList]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al obtener torneos: ' . $e->getMessage()]);
}
?>
