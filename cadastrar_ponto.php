<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/conexao.php';

// Conta caracteres UTF-8 sem exigir a extensão mbstring (no Fedora ela é um pacote à parte).
function tamanho_texto(string $texto): int
{
    return function_exists('mb_strlen')
        ? mb_strlen($texto, 'UTF-8')
        : (int) preg_match_all('/./us', $texto);
}

function responder(int $status, array $dados): void
{
    http_response_code($status);
    echo json_encode($dados, JSON_UNESCAPED_UNICODE);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    responder(405, ['sucesso' => false, 'mensagem' => 'Método não permitido.']);
}

$dados = json_decode(file_get_contents('php://input'), true);

if (!is_array($dados)) {
    responder(400, ['sucesso' => false, 'mensagem' => 'Dados inválidos.']);
}

$nome = trim($dados['nome'] ?? '');
$descricao = trim($dados['descricao'] ?? '');
$latitude = filter_var($dados['latitude'] ?? null, FILTER_VALIDATE_FLOAT);
$longitude = filter_var($dados['longitude'] ?? null, FILTER_VALIDATE_FLOAT);

if ($nome === '') {
    responder(422, ['sucesso' => false, 'mensagem' => 'Informe o nome do ponto turístico.']);
}

if (tamanho_texto($nome) > 150) {
    responder(422, ['sucesso' => false, 'mensagem' => 'O nome deve ter no máximo 150 caracteres.']);
}

if ($latitude === false || $longitude === false ||
    $latitude < -90 || $latitude > 90 ||
    $longitude < -180 || $longitude > 180) {
    responder(422, ['sucesso' => false, 'mensagem' => 'Coordenadas inválidas.']);
}

try {
    $sql = 'INSERT INTO tb_pontos_turisticos
                (nome_ponto, descricao_ponto, latitude, longitude)
            VALUES
                (:nome, :descricao, :latitude, :longitude)
            RETURNING id_ponto_turistico, nome_ponto, descricao_ponto,
                    latitude, longitude, dt_criacao';

    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':nome' => $nome,
        ':descricao' => $descricao !== '' ? $descricao : null,
        ':latitude' => $latitude,
        ':longitude' => $longitude
    ]);

    $ponto = $stmt->fetch();

    responder(201, [
        'sucesso' => true,
        'mensagem' => 'Ponto turístico cadastrado com sucesso.',
        'ponto' => $ponto
    ]);
} catch (PDOException $e) {
    error_log($e->getMessage());
    responder(500, ['sucesso' => false, 'mensagem' => 'Não foi possível cadastrar o ponto turístico.']);
}
