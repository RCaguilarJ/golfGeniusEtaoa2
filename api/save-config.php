<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

// Obtener datos del POST
$input = json_decode(file_get_contents('php://input'), true);

$event_id = $input['event_id'] ?? null;
$round_id = $input['round_id'] ?? null;
$tournament_id = $input['tournament_id'] ?? null;

if (!$event_id) {
    echo json_encode(['error' => 'Falta el parámetro event_id']);
    exit;
}

try {
    // 💾 Guardar la configuración en la base de datos
    $stmt = $pdo->prepare("INSERT INTO api_config (event_id, round_id, tournament_id) VALUES (?, ?, ?)");
    $stmt->execute([$event_id, $round_id, $tournament_id]);
    
    echo json_encode(['success' => true, 'message' => 'Configuración guardada correctamente']);
    
} catch (PDOException $e) {
    echo json_encode(['error' => 'Error al guardar configuración: ' . $e->getMessage()]);
}
?>
