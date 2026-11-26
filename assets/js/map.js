
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

        // Impede movimentar o mapa, mas permite alterar o zoom.
        draggable: false,
        keyboardShortcuts: false,
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

    mapa.addListener("click", function (evento) {
        if (!evento.latLng) {
            return;
        }

        const latitude = evento.latLng.lat().toFixed(7);
        const longitude = evento.latLng.lng().toFixed(7);

        document.getElementById("latitude").value = latitude;
        document.getElementById("longitude").value = longitude;
    });
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
            const resposta = await fetch("cadastrar_ponto.php", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(dados)
            });

            const resultado = await resposta.json();

            if (!resposta.ok || !resultado.sucesso) {
                alert(
                    resultado.mensagem ||
                    "Erro ao cadastrar o ponto."
                );
                return;
            }

            const ponto = resultado.ponto;

            // Adiciona o marcador após o cadastro bem-sucedido.
            adicionarMarcador(
                ponto.latitude,
                ponto.longitude,
                ponto.nome_ponto
            );

            alert(resultado.mensagem);

        } catch (erro) {
            console.error("Erro na requisição:", erro);

            alert(
                "Não foi possível comunicar com o servidor."
            );
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

    const pin = new google.maps.marker.PinElement({
        background: "#EA4335",
        borderColor: "#B31412",
        glyphColor: "#FFFFFF"
    });

    const marcador = new google.maps.marker.AdvancedMarkerElement({
        map: mapa,
        position: {
            lat: lat,
            lng: lng
        },
        title: titulo
    });

    marcador.append(pin);

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
