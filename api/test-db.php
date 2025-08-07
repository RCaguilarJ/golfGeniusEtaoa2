<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Probar conexión a la base de datos
try {
    // 🗄️ Configuración de la base de datos
    $host = 'localhost';
    $dbname = 'golfgenius';
    $username = 'root';
    $password = '';

    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    
    // Probar si la tabla existe
    $stmt = $pdo->query("SHOW TABLES LIKE 'api_config'");
    $tableExists = $stmt->rowCount() > 0;
    
    if (!$tableExists) {
        echo json_encode([
            'error' => 'La tabla api_config no existe en la base de datos',
            'database' => $dbname,
            'suggestion' => 'Importa el archivo golfgeniusSergio.sql'
        ]);
        exit;
    }
    
    // Probar si hay datos en la tabla
    $stmt = $pdo->query("SELECT COUNT(*) as count FROM api_config");
    $result = $stmt->fetch();
    
    if ($result['count'] == 0) {
        echo json_encode([
            'error' => 'La tabla api_config está vacía',
            'suggestion' => 'Inserta algunos datos en la tabla'
        ]);
        exit;
    }
    
    // Mostrar algunos datos de prueba
    $stmt = $pdo->query("SELECT * FROM api_config LIMIT 5");
    $data = $stmt->fetchAll();
    
    echo json_encode([
        'success' => true,
        'message' => 'Conexión exitosa',
        'table_exists' => $tableExists,
        'total_records' => $result['count'],
        'sample_data' => $data
    ]);
    
} catch (PDOException $e) {
    echo json_encode([
        'error' => 'Error de conexión a la base de datos',
        'details' => $e->getMessage(),
        'suggestion' => 'Verifica que WAMP esté corriendo y que la base de datos exista'
    ]);
}
?>
