<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Método não permitido.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $sql = 'SELECT id_ponto_turistico, nome_ponto, descricao_ponto,
                   latitude, longitude, dt_criacao
            FROM tb_pontos_turisticos
            ORDER BY dt_criacao DESC, id_ponto_turistico DESC';

    $pontos = $pdo->query($sql)->fetchAll();

    echo json_encode(['sucesso' => true, 'pontos' => $pontos], JSON_UNESCAPED_UNICODE);
} catch (PDOException $e) {
    error_log($e->getMessage());
    http_response_code(500);
    echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível carregar os pontos turísticos.'], JSON_UNESCAPED_UNICODE);
}
