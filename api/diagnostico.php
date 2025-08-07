<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Diagnóstico paso a paso
$diagnostico = [];

try {
    // 1. Probar conexión básica
    $host = 'localhost';
    $dbname = 'golfgenius';
    $username = 'root';
    $password = '';
    
    $diagnostico['step1'] = 'Intentando conectar...';
    
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    $diagnostico['step2'] = 'Conexión exitosa';
    
    // 2. Verificar que la tabla existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'api_config'");
    $tableExists = $stmt->rowCount() > 0;
    $diagnostico['step3'] = $tableExists ? 'Tabla api_config existe' : 'Tabla api_config NO existe';
    
    if (!$tableExists) {
        throw new Exception('La tabla api_config no existe');
    }
    
    // 3. Contar registros
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM api_config");
    $result = $stmt->fetch();
    $diagnostico['step4'] = "Total registros: " . $result['count'];
    
    // 4. Buscar eventos específicamente
    $stmt = $pdo->query("SELECT DISTINCT event_id FROM api_config WHERE event_id IS NOT NULL");
    $eventos = $stmt->fetchAll();
    $diagnostico['step5'] = "Eventos encontrados: " . count($eventos);
    $diagnostico['eventos_raw'] = $eventos;
    
    // 5. Intentar la consulta exacta de get-events.php
    $stmt = $pdo->query("SELECT DISTINCT event_id FROM api_config WHERE event_id IS NOT NULL ORDER BY created_at DESC");
    $events = $stmt->fetchAll();
    
    $eventsList = [];
    foreach ($events as $event) {
        $eventsList[] = [
            'event_id' => $event['event_id']
        ];
    }
    
    $diagnostico['step6'] = 'Query exitosa';
    $diagnostico['final_result'] = ['events' => $eventsList];
    
    echo json_encode($diagnostico);
    
} catch (PDOException $e) {
    $diagnostico['error'] = 'Error PDO: ' . $e->getMessage();
    $diagnostico['error_code'] = $e->getCode();
    echo json_encode($diagnostico);
} catch (Exception $e) {
    $diagnostico['error'] = 'Error general: ' . $e->getMessage();
    echo json_encode($diagnostico);
}
?>
