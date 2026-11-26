<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'conexao.php';

$dados = json_decode(file_get_contents('php://input'), true);

$nome = trim($dados['nome'] ?? '');
$descricao = trim($dados['descricao'] ?? '');
$latitude = $dados['latitude'] ?? '';
$longitude = $dados['longitude'] ?? '';

if ($nome == '' || $latitude == '' || $longitude == '') {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Preencha o nome e escolha um local no mapa.']);
    exit;
}

try {
    // Os ":nome", ":descricao"... são preenchidos no execute (evita SQL injection)
    $sql = 'INSERT INTO tb_pontos_turisticos (nome_ponto, descricao_ponto, latitude, longitude)
            VALUES (:nome, :descricao, :latitude, :longitude)
            RETURNING *';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':descricao' => $descricao,
        ':latitude' => $latitude,
        ':longitude' => $longitude
    ]);

    $ponto = $stmt->fetch();

    echo json_encode([
        'sucesso' => true,
        'mensagem' => 'Ponto turístico cadastrado com sucesso.',
        'ponto' => $ponto
    ]);
} catch (PDOException $e) {
    echo json_encode(['sucesso' => false, 'mensagem' => 'Não foi possível cadastrar o ponto turístico.']);
}
