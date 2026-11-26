<?php

require 'dados.php';
$host = 'localhost';
$port = '5432';
$dbname = 'turismo';


try {
    $pdo = new PDO(
        "pgsql:host=$host;port=$port;dbname=$dbname",
        $user,
        $password,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    die(json_encode(['sucesso' => false, 'mensagem' => 'Erro ao conectar ao banco de dados.'], JSON_UNESCAPED_UNICODE));
}
