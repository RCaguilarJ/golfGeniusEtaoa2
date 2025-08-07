<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

$event_id = $_GET['event_id'] ?? null;

if (!$event_id) {
    echo json_encode(['error' => 'Falta el parámetro event_id']);
    exit;
}

try {
    // 🎯 Obtener todas las rondas para un evento específico
    $stmt = $pdo->prepare("SELECT DISTINCT round_id FROM api_config WHERE event_id = ? AND round_id IS NOT NULL ORDER BY created_at ASC");
    $stmt->execute([$event_id]);
    $rounds = $stmt->fetchAll();
    
    $roundsList = [];
    foreach ($rounds as $round) {
        $roundsList[] = [
            'round_id' => $round['round_id']
        ];
    }
    
    echo json_encode(['rounds' => $roundsList]);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al obtener rondas: ' . $e->getMessage()]);
}
?>
