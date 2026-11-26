<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'conexao.php';

try {
    // Busca todos os pontos, do mais novo para o mais antigo
    $sql = 'SELECT * FROM tb_pontos_turisticos ORDER BY id_ponto_turistico DESC';
    $pontos = $pdo->query($sql)->fetchAll();

    echo json_encode(['sucesso' => true, 'pontos' => $pontos]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível carregar os pontos turísticos.']);
}