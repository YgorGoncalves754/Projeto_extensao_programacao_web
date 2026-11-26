// Região aproximada de Rio do Sul e arredores.
const LIMITES_REGIAO = {
    north: -26.85,
    south: -27.65,
    west: -50.10,
    east: -49.20
};

// Coordenadas aproximadas do centro de Rio do Sul.
const CENTRO_RIO_DO_SUL = {
    lat: -27.2145,
    lng: -49.6430
};

let mapa = null;
let marcadores = [];

// Marcador vermelho temporário: mostra o local escolhido antes de salvar.
let marcadorSelecao = null;

// O Google chama esta função sozinho quando recusa a chave da API
// (chave errada, sem permissão ou com restrição de domínio).
window.gm_authFailure = function () {
    alert("O Google Maps recusou a chave da API. Confira a chave e as restrições dela no Google Cloud Console.");
};

/**
 * Chama um arquivo PHP e devolve o JSON já convertido.
 * Os PHP sempre respondem com "sucesso" (true/false): é ele que decide se deu certo.
 * Se algo der errado, lança um erro com a mensagem que deve aparecer para o usuário.
 */
async function chamarPhp(url, opcoes) {
    let resposta;

    try {
        resposta = await fetch(url, opcoes);
    } catch (e) {
        throw new Error("Não foi possível comunicar com o servidor.");
    }

    const texto = await resposta.text();
    let resultado;

    try {
        resultado = JSON.parse(texto);
    } catch (e) {
        // Não é JSON: arquivo não encontrado (404), erro do PHP, página sendo aberta sem servidor PHP...
        console.error(url, "-> HTTP", resposta.status, "| resposta:", texto.slice(0, 300));
        throw new Error("O servidor não devolveu JSON em " + url + " (HTTP " + resposta.status + "). Veja o console (F12).");
    }

    if (!resultado.sucesso) {
        throw new Error(resultado.mensagem || "Erro ao chamar " + url + ".");
    }

    return resultado;
}

function initMap() {
    const divMapa = document.getElementById("mapa");

    const limites = new google.maps.LatLngBounds(
        {
            lat: LIMITES_REGIAO.south,
            lng: LIMITES_REGIAO.west
        },
        {
            lat: LIMITES_REGIAO.north,
            lng: LIMITES_REGIAO.east
        }
    );

    // Inicialização do mapa.
    mapa = new google.maps.Map(divMapa, {
        mapTypeId: "satellite",
        mapId: "DEMO_MAP_ID",

        // Centraliza o mapa em Rio do Sul.
        center: CENTRO_RIO_DO_SUL,

        // Zoom inicial.
        zoom: 11,

        // Permite arrastar o mapa e dar zoom; a navegação fica limitada
        // à região definida em "restriction" abaixo.
        draggable: true,
        gestureHandling: "greedy",
        keyboardShortcuts: true,
        scrollwheel: true,
        zoomControl: true,
        disableDoubleClickZoom: false,

        // Restringe a navegação à região configurada.
        restriction: {
            latLngBounds: limites,
            strictBounds: true
        }
    });

    configurarFormulario();

    // Clique no mapa: posiciona o marcador vermelho e envia as coordenadas ao formulário.
    mapa.addListener("click", function (evento) {
        if (!evento.latLng) {
            return;
        }

        selecionarLocalizacao(evento.latLng);
    });

    // Ao abrir o site, busca os pontos salvos no banco e mostra na tela.
    carregarPontos();
}

/**
 * Busca os pontos no banco (listar_pontos.php) e desenha marcadores + lista.
 */
async function carregarPontos() {
    const lista = document.getElementById("pontos-cadastrados");

    try {
        const resultado = await chamarPhp("listar_pontos.php");

        limparMarcadores();
        if (lista) {
            lista.replaceChildren();
        }

        resultado.pontos.forEach(adicionarPonto);

        if (lista && resultado.pontos.length === 0) {
            lista.textContent = "Nenhum ponto turístico cadastrado ainda.";
        }
    } catch (erro) {
        console.error("Erro ao carregar pontos:", erro);
        if (lista) {
            lista.textContent = erro.message;
        }
    }
}

/**
 * Mostra um ponto no mapa (marcador) e na lateral (lista).
 */
function adicionarPonto(ponto) {
    const marcador = adicionarMarcador(
        ponto.latitude,
        ponto.longitude,
        ponto.nome_ponto
    );

    const lista = document.getElementById("pontos-cadastrados");
    if (!lista) {
        return;
    }

    // Remove a mensagem de "nenhum ponto" se ela estiver lá.
    if (!lista.querySelector(".ponto-item")) {
        lista.replaceChildren();
    }

    const item = document.createElement("article");
    item.className = "ponto-item";

    const titulo = document.createElement("h3");
    titulo.textContent = ponto.nome_ponto;
    item.appendChild(titulo);

    if (ponto.descricao_ponto) {
        const descricao = document.createElement("p");
        descricao.textContent = ponto.descricao_ponto;
        item.appendChild(descricao);
    }

    // Clicar no item leva o mapa até o ponto.
    item.addEventListener("click", function () {
        if (!marcador) {
            return;
        }
        mapa.panTo(marcador.position);
        mapa.setZoom(16);
    });

    lista.prepend(item);
}

/**
 * Cria um PinElement vermelho.
 */
function criarPinVermelho() {
    const pin = new google.maps.marker.PinElement({
        background: "#EA4335",
        borderColor: "#B31412",
        glyphColor: "#FFFFFF"
    });

    // Em versões mais recentes o PinElement já é o próprio elemento HTML.
    return pin.element || pin;
}

/**
 * Preenche os campos de latitude/longitude do formulário.
 */
function preencherCoordenadas(lat, lng) {
    document.getElementById("latitude").value = Number(lat).toFixed(7);
    document.getElementById("longitude").value = Number(lng).toFixed(7);
}

/**
 * Lê lat/lng de uma posição, que pode ser LatLng ou literal {lat, lng}.
 */
function lerPosicao(pos) {
    return {
        lat: typeof pos.lat === "function" ? pos.lat() : pos.lat,
        lng: typeof pos.lng === "function" ? pos.lng() : pos.lng
    };
}

/**
 * Coloca (ou move) o marcador vermelho de seleção e atualiza o formulário.
 */
function selecionarLocalizacao(latLng) {
    const { lat, lng } = lerPosicao(latLng);

    if (!marcadorSelecao) {
        marcadorSelecao = new google.maps.marker.AdvancedMarkerElement({
            map: mapa,
            position: { lat: lat, lng: lng },
            title: "Local selecionado (arraste para ajustar)",
            content: criarPinVermelho(),
            gmpDraggable: true
        });

        // Ao arrastar o marcador, as coordenadas do formulário acompanham.
        marcadorSelecao.addListener("dragend", function () {
            const posicao = lerPosicao(marcadorSelecao.position);
            preencherCoordenadas(posicao.lat, posicao.lng);
        });
    } else {
        marcadorSelecao.position = { lat: lat, lng: lng };
    }

    preencherCoordenadas(lat, lng);
}

/**
 * Remove o marcador de seleção e limpa o formulário.
 */
function limparSelecao() {
    if (marcadorSelecao) {
        marcadorSelecao.map = null;
        marcadorSelecao = null;
    }

    document.getElementById("latitude").value = "";
    document.getElementById("longitude").value = "";
}

// Configura o envio do formulário.
function configurarFormulario() {
    const formulario = document.getElementById(
        "form-cadastro-ponto"
    );

    const botaoCancelar = document.getElementById(
        "btn-cancelar-cadastro"
    );

    if (!formulario) {
        console.warn("Formulário de cadastro não encontrado.");
        return;
    }

    if (botaoCancelar) {
        botaoCancelar.addEventListener("click", function () {
            formulario.reset();
            limparSelecao();
        });
    }

    formulario.addEventListener("submit", async function (evento) {
        evento.preventDefault();

        const latitude = document.getElementById("latitude").value;
        const longitude = document.getElementById("longitude").value;

        if (!latitude || !longitude) {
            alert("Selecione uma localização no mapa antes de cadastrar.");
            return;
        }

        const dados = {
            nome: document.getElementById("nome").value,
            descricao: document.getElementById("descricao").value,
            latitude: document.getElementById("latitude").value,
            longitude: document.getElementById("longitude").value
        };

        try {
            const resultado = await chamarPhp("cadastrar_ponto.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dados)
            });

            // Troca o marcador temporário pelo definitivo e limpa o formulário.
            limparSelecao();
            formulario.reset();

            adicionarPonto(resultado.ponto);

            alert(resultado.mensagem);

        } catch (erro) {
            console.error("Erro ao cadastrar:", erro);
            alert(erro.message);
        }
    });
}

/**
 * Cria um marcador no mapa.
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {string} titulo
 */
function adicionarMarcador(latitude, longitude, titulo = "Ponto cadastrado") {
    if (!mapa) {
        console.error("O mapa ainda não foi inicializado.");
        return null;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.error("Coordenadas inválidas:", latitude, longitude);
        return null;
    }

    const marcador = new google.maps.marker.AdvancedMarkerElement({
        map: mapa,
        position: {
            lat: lat,
            lng: lng
        },
        title: titulo,
        content: criarPinVermelho()
    });

    marcadores.push(marcador);

    return marcador;
}

/**
 * Remove todos os marcadores adicionados.
 */
function limparMarcadores() {
    marcadores.forEach(function (marcador) {
        marcador.map = null;
    });

    marcadores = [];
}

/**
 * Retorna os limites da região atualmente visível no mapa.
 */
function getViewPort() {
    if (!mapa) {
        return null;
    }

    const limites = mapa.getBounds();

    if (!limites) {
        return null;
    }

    const northEast = limites.getNorthEast();
    const southWest = limites.getSouthWest();

    return {
        north: northEast.lat(),
        east: northEast.lng(),
        south: southWest.lat(),
        west: southWest.lng()
    };
}
