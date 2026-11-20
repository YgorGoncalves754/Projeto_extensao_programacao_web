const LIMITES_BRASIL = {
    north: 5.27,
    south: -33.75,
    west: -73.99,
    east: -34.79
};

let mapa = null;
let modoAdicionarLocal = false;
const marcadores = [];

function initMap() {
    const divMapa = document.getElementById("mapa");

    const limites = new google.maps.LatLngBounds(
        {
            lat: LIMITES_BRASIL.south,
            lng: LIMITES_BRASIL.west
        },
        {
            lat: LIMITES_BRASIL.north,
            lng: LIMITES_BRASIL.east
        }
    );

    // Inicialização do mapa.
    mapa = new google.maps.Map(divMapa, {
        mapTypeId: "satellite",
        mapId: "DEMO_MAP_ID",

        // Centro aproximado do Brasil.
        center: {
            lat: -14.2350,
            lng: -51.9253
        },

        // Zoom inicial para visualizar o Brasil inteiro.
        zoom: 3,

        // Permite navegar pela região do Brasil e arredores.
        restriction: {
            latLngBounds: limites,
            strictBounds: false
        }
    });

    configurarBotaoAdicionar();

    // Evento de clique no mapa.
    mapa.addListener("click", function (evento) {
        if (!modoAdicionarLocal || !evento.latLng) {
            return;
        }

        const latitude = evento.latLng.lat();
        const longitude = evento.latLng.lng();

        const marcador = adicionarMarcador(
            latitude,
            longitude,
            "Novo ponto (ainda não salvo)"
        );

        if (marcador) {
            modoAdicionarLocal = false;

            const botao = document.getElementById(
                "btn-adicionar-local"
            );

            if (botao) {
                botao.textContent = "Adicionar Local";
            }

            console.log("Marcador criado:", {
                latitude: latitude,
                longitude: longitude
            });
        }
    });
}

// Configura o botão de adicionar localização.
function configurarBotaoAdicionar() {
    const botao = document.getElementById(
        "btn-adicionar-local"
    );

    if (!botao) {
        console.warn("Botão de adicionar local não encontrado.");
        return;
    }

    botao.addEventListener("click", function () {
        modoAdicionarLocal = !modoAdicionarLocal;

        botao.textContent = modoAdicionarLocal
            ? "Cancelar seleção"
            : "Adicionar Local";
    });
}

/**
 * Cria um marcador no mapa.
 *
 * @param {number|string} latitude
 * @param {number|string} longitude
 * @param {string} titulo
 */
function adicionarMarcador(
    latitude,
    longitude,
    titulo = "Ponto cadastrado"
) {
    if (!mapa) {
        console.error("O mapa ainda não foi inicializado.");
        return null;
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        console.error("Coordenadas inválidas.");
        return null;
    }

    const marcador = new google.maps.marker.AdvancedMarkerElement({
        map: mapa,
        position: {
            lat: lat,
            lng: lng
        },
        title: titulo
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

    marcadores.length = 0;
}

/**
 * Retorna os limites da região visível no mapa.
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
