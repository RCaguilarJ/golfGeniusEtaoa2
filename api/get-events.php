<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

try {
    // Incluir el archivo de conexión
    require_once 'db.php';
    
    // 📋 Obtener todos los eventos únicos de la tabla api_config
    $stmt = $pdo->query("SELECT DISTINCT event_id FROM api_config WHERE event_id IS NOT NULL ORDER BY created_at DESC");
    $events = $stmt->fetchAll();
    
    $eventsList = [];
    foreach ($events as $event) {
        $eventsList[] = [
            'event_id' => $event['event_id']
        ];
    }
    
    echo json_encode(['events' => $eventsList]);
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Error de base de datos: ' . $e->getMessage(),
        'code' => $e->getCode(),
        'file' => basename(__FILE__)
    ]);
} catch (Exception $e) {
    echo json_encode([
        'error' => 'Error general: ' . $e->getMessage(),
        'file' => basename(__FILE__)
    ]);
}
?>
