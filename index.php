<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="assets/css/index.css">
    <title>Pontos turísticos em Rio do Sul</title>
</head>
<body>
    <header>
        <nav id="navegacao">
            <div id="espaco">
            </div>
            <ul id="lista_navegacao">
                <li><a href="index.html">Home</a></li>
                <li><a href="avaliar.html">Avaliar</a></li>
                <li><a href="sobre.html">Sobre</a></li>
            </ul>
            <div id="entrar">
                <li><a href="entrar.html">Entrar</a></li>
            </div>
        </nav>
    </header>

    <main>
        <div id="menu-mapa">
            <div id="mapa">

            </div>
            <div id="menu-acoes">
                <button>Adicionar Local</button>
            </div>
        </div>

        <aside id="pontos-cadastrados">

        </aside>
    </main>

    <footer id="rodape">
        <p>&copy 2026 Ygor Gonçalves e Gabriel Koch da Silva. Todos os direitos reservados.</p>
    </footer>
    <script src="assets/js/map.js"></script>
    <script
        src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDecZ62iiTMV0Nkm5lS1EMNvAr5R-RMcx8&callback=initMap&v=weekly"
        async
        defer>
    </script>
</body>
</html>
