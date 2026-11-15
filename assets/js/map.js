function initMap() {
    const configs = {
        mapTypeId : 'satellite'
    };

    const divMapa = document.getElementById("mapa");

    /**
     * Esses dois objetos abaixam setam o a view padrão mostrada no mapa (no caso o Brasil)
     * Se quiser mudar, para por exemplo só SC ou rio do sul, da um google ai nas coordendadas e insere ai.
     */
    const southWest = {
            lat : -33.75,
            lng : -73.99,
    };

    const northEast = {
            lat : 5.27,
            lng : -34.79,
    };

    const limites = new google.maps.LatLngBounds(southWest, northEast);
    const mapa = new google.maps.Map(divMapa, configs).fitBounds(limites);
}


function getViewPort() {
    
}
