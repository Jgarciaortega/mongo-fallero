


function obtenerJSON() {

    let request = 'http://mapas.valencia.es/lanzadera/opendata/Monumentos_falleros/JSON';

    fetch(request)
        .then(response => response.json())
        .then(function (datos) {

            obtenerDatos(datos);

        });
}

function obtenerSecciones(datos) {

    datos.features.forEach(dato => {

        if (seccionesPrincipales.indexOf(dato.properties.seccion) == -1) {

            seccionesPrincipales.push(dato.properties.seccion);
        }

        //.sort no ordena las fallas infantiles ya que ordena por ASCII. Por ello parseo a int y comprueba
        //que todos los parses sean numeros (!isNan)
        if (seccionesInfantiles.indexOf(parseInt(dato.properties.seccion_i)) == -1 &&
            !isNaN(parseInt(dato.properties.seccion_i))) {

            seccionesInfantiles.push(parseInt(dato.properties.seccion_i));
        }

    });

    //Ordenar datos antes de mostrar
    ordenarSecciones();

}

function sortNumber(a, b) {
    return a - b;
}

function ordenarSecciones() {

    //Secciones principales ordenadas con .sort
    seccionesPrincipales.sort();

    // seccionesInfantiles = Array.from(seccionesInfantiles).sort();
    seccionesInfantiles.sort(sortNumber);

    //Mostramos el dato con Seccion delante...
    anyadirTexto(seccionesPrincipales);
    anyadirTexto(seccionesInfantiles);

}

function anyadirTexto(seccion) {

    for (let i = 0; i < seccion.length; i++) {

        if (seccion[i] == 'E') seccion[i] = 'Seccion Especial';
        else if (seccion[i] == 'FC') seccion[i] = 'Fuera de categoria';
        else seccion[i] = 'Seccion :' + seccion[i];

    }

    seccion.push('Todas las secciones');
}

function mostrarFallas() {

    let filtroSeccion = document.querySelector('select').value;
    let contFichasFallas = document.getElementById('fichasFallas');
    let anyoValido = false;

    /*Ya que el formato filtroSeleccion se ha modificado para que sea mas legible he de adaptarlo para coincidir 
    con la busqueda en el JSON */
    filtroSeccion = adaptarFiltroSeccion(filtroSeccion);

    //Datos por los que se va a filtrar la busqueda:
    let seccionABuscar;
    let imgABuscar;
    let anyoFundacion;
    let ubicacionFalla;
    let coordenadas = convertirCoordenada(this.value);
    //console.log(datosJSON);

    limpiarNodo(contFichasFallas);

    for (let i = 0; i < datosJSON.features.length; i++) {

        if (seccionPpalActiva) {

            seccionABuscar = datosJSON.features[i].properties.seccion;
            imgABuscar = datosJSON.features[i].properties.boceto;
            anyoFundacion = datosJSON.features[i].properties.anyo_fundacion;

        }
        else {

            seccionABuscar = datosJSON.features[i].properties.seccion_i;
            imgABuscar = datosJSON.features[i].properties.boceto_i;
            anyoFundacion = datosJSON.features[i].properties.anyo_fundacion_i;
        }

        ubicacionFalla = datosJSON.features[i].geometry.coordinates;
        anyoValido = validarAnyo(parseInt(anyoFundacion));

        if (anyoValido && filtroSeccion == seccionABuscar || filtroSeccion == 'Todas las secciones') {

            //Contenedor principal con toda la info de la falla
            let falla = document.createElement('div');
            falla.classList.add('contenedorFalla');
            /*idFalla utilizado para buscar mejor en el DOM una falla concreta */
            falla.setAttribute('id', datosJSON.features[i].properties.id);
            fichasFallas.appendChild(falla);

            //Contenedor del titulo-nombre falla
            let divNombreFalla = document.createElement('div');
            divNombreFalla.classList.add('nombreFalla');
            divNombreFalla.innerHTML = datosJSON.features[i].properties.nombre;
            falla.appendChild(divNombreFalla);

            //Contenedor imagen e imagen falla
            let divImgFalla = document.createElement('div');
            divImgFalla.classList.add('contenedorImg');
            let img = document.createElement('img');
            img.setAttribute('src', imgABuscar);
            divImgFalla.appendChild(img);
            falla.appendChild(divImgFalla);

            //Contenedor con toda la info extra(ubicacion,puntuacion...)
            let divMetadatos = document.createElement('div');
            falla.appendChild(divMetadatos);

            //Boton ubicacion
            let btnUbicacion = document.createElement('button');
            btnUbicacion.innerHTML = 'UBICACIÓN';
            btnUbicacion.setAttribute('value', i);
            btnUbicacion.addEventListener('click', mostrarUbicacion);
            divMetadatos.classList.add('contenedorMetadatos');
            divMetadatos.appendChild(btnUbicacion);

            //Contenedor con los botones borrar y  puntuacion
            let divPuntuacion = document.createElement('div');
            divPuntuacion.classList.add('contenedorPuntuacion');
            divMetadatos.appendChild(divPuntuacion);

            //Puntuacion falla
            let formPuntuacion = document.createElement('form');
            let p = document.createElement('p');
            p.classList.add('puntuacion');
            for (let x = idLabelPtos, y = 5; x < idLabelPtos + 5; x++ , y--) {

                let input = document.createElement('input');
                input.setAttribute('id', 'radio' + x);
                input.setAttribute('type', 'radio');
                input.setAttribute('name', 'estrellas' + x);
                input.setAttribute('value', y);
                input.setAttribute('idFalla', datosJSON.features[i].properties.id);
                p.appendChild(input);

                let label = document.createElement('label');
                label.setAttribute('for', 'radio' + x);
                label.innerHTML = '★';
                label.addEventListener('mouseup', anotarPuntuacion);
                p.appendChild(label);

            }
            /*Incrementamos la variable global en 5 para que sean distintas la siguiente tanda de estrellas
            De no ser asi cuando pulsamos sobre una estrella con un id igual a otra aplica cambios a la que tiene
            mismo id*/
            idLabelPtos += 5;
            formPuntuacion.appendChild(p);
            divPuntuacion.appendChild(formPuntuacion);

            //Boton borrar puntuacion
            let btnDelete = document.createElement('button');
            btnDelete.innerHTML = 'BORRAR';
            btnDelete.setAttribute('value', borrarPuntuacion);
            btnDelete.setAttribute('idFalla', datosJSON.features[i].properties.id);
            btnDelete.addEventListener('click', borrarPuntuacion);
            divPuntuacion.appendChild(btnDelete);


        }

        anyoValido = false;
    }

    /*Obtenemos los datos que tenemos recopilados en la BBDD para mostrar las votaciones medias
    del publico y para comprobar si desde el cliente ya se ha puntuado alguna falla (y mostrarla
        en caso de que exista la puntuacion)*/
    obtiene_BBDD();

    //alert('Para crear puntuaciones ficticias de diferentes usuarios pon la línea 515 de public/cliente.js como no comentada');

}

function obtiene_BBDD() {

    conexionGET('/api/puntuaciones', mostrarPuntuacionPublico);

}

function borrarPuntuacion() {

    let id = this.attributes.idFalla.value;
    let datos = { idFalla: id, ip: ipCliente, puntuacion: 0 };
    let form = document.getElementById(id).childNodes[2].childNodes[1].childNodes[0];

    //Primero eliminamos las estrellas del front End
    eliminarChecked(form);

    /*Segundo la borramos del back End
    Existe nos devuelve un json con el _id de mongo*/
    fetch('/api/puntuaciones/existe/' + id + '/' + ipCliente)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            //Aplicamos delete sobre el _id devuelto
            if (myJson != false) {
                url = '/api/puntuaciones/' + myJson[0]._id;
                fetch(url, {
                    method: 'DELETE',
                    body: JSON.stringify(datos),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
                    .catch(error => console.error('Error:', error))
                    .then(alert('Puntuacion borrada'));

            }
        });

}

//Si desde esa ip se han hecho votos...
function averiguaSiClienteVoto() {

    for (let i = 0; i < datosJSON.features.length; i++)

        fetch('/api/puntuaciones/existe/' + datosJSON.features[i].properties.id + '/' + ipCliente)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
                if (myJson != false) {
                    mostrarPuntuacionCliente(myJson);
                }
            });
}

function actualizarPuntuacion(form, puntuacion) {

    let res = 5 - puntuacion;

    form[res].checked = true;

}

function eliminarChecked(form) {

    for (let input of form) {

        input.checked = false;

    }
}

//Cargamos las puntuaciones que el cliente tiene registradas en la BBDD
function mostrarPuntuacionCliente(datos) {

    for (let i = 0; i < datos.length; i++) {

        try {
            let form = document.getElementById(datos[i].idFalla).childNodes[2].childNodes[1].childNodes[0];
            let puntuacion = datos[i].puntuacion;

            actualizarPuntuacion(form, puntuacion);

        } catch (TypeError) {

            /*si no se selecciona ver todas las secciones, hay elementos del dom que no son accesibles
            por ello se pone un try catch*/
        }

    }

}

function anotarPuntuacion() {

    let ptos = this.previousSibling.value;
    let id = this.previousSibling.attributes.idfalla.value;
    let url;
    let datos = { idFalla: id, ip: ipCliente, puntuacion: ptos };

    fetch('/api/puntuaciones/existe/' + id + '/' + ipCliente)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {

            if (myJson == false) {

                url = '/api/puntuaciones';
                conexionServer(url, 'POST', datos, 'La puntuacion se ha registrado correctamente');

            } else {

                url = '/api/puntuaciones/' + myJson[0]._id;
                conexionServer(url, 'PUT', datos, 'La puntuacion se ha modificado correctamente');
                let form = document.getElementById(id).childNodes[2].childNodes[1].childNodes[0];
                eliminarChecked(form);
                actualizarPuntuacion(form, ptos);

            }
        });

}

//Muestra la media de estrellas obtenidas por las votaciones de los usuarios y si el cliente ha votado muestra su voto
function mostrarPuntuacionPublico(datos) {

    //Creamos un array con objetos fallas creados a partir de los datos de la BBDD
    let arrayFallas = [];

    for (let i = 0; i < datos.length; i++) {

        let id = datos[i].idFalla;
        let ptos = datos[i].puntuacion;
        let ip = datos[i].ip;

        let falla = buscaFalla(id, arrayFallas);

        if (falla != '') {

            falla.vecesVotada++;
            falla.mediaPtos = falla.ptosTotales / falla.vecesVotada;

        } else {

            let falla = new Falla(id, ptos, 1, ptos, ip);
            arrayFallas.push(falla);

        }
    }

    for (let i = 0; i < arrayFallas.length; i++) {

        //PUNTUACIONES PUBLICO
        let ptos = Math.round(arrayFallas[i].ptosTotales);

        try {

            let divNombreFalla = document.getElementById(arrayFallas[i].idFalla).childNodes[0];
            let divFalla = document.getElementById(arrayFallas[i].idFalla);
            let p = document.createElement('p');
            let text = document.createTextNode('Valoración público: ');
            p.appendChild(text);

            if (ptos >= 4) divFalla.classList.add('resaltado');


            //Creo estrellas desde 0 hasta los ptos de media que ha obtenido
            for (let x = 0; x < ptos; x++) {

                let label = document.createElement('label');
                label.innerHTML = '★';
                p.appendChild(label);
            }

            divNombreFalla.appendChild(p);

        } catch (TypeError) {

            /*si no se selecciona ver todas las secciones, hay elementos del dom que no son accesibles
            por ello se pone un try catch*/
        }

    }
    averiguaSiClienteVoto();
}

//Devuelve el objeto falla si este existe
function buscaFalla(idFalla, arrayFalla) {

    let falla = '';

    for (let i = 0; i < arrayFalla.length; i++) {

        if (idFalla == arrayFalla[i].idFalla) {

            falla = arrayFalla[i];
        }
    }

    return falla;
}

function conexionGET(url, funcion) {

    fetch(url)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {

            funcion(myJson);
        });

}

function conexionServer(url, metodo, datos, mensaje) {

    fetch(url, {
        method: metodo,
        body: JSON.stringify(datos),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(res => res.json())
        .catch(error => console.error('Error:', error))
        .then(alert(mensaje));

}

/*Ya que el formato filtroSeleccion se ha modificado para que sea mas legible he de adaptarlo para coincidir 
con la busqueda en el JSON */
function adaptarFiltroSeccion(filtro) {

    if (filtro == 'Seccion Especial') filtro = 'E';
    else if (filtro == 'Fuera de categoria') filtro = 'FC';
    else {
        let cont = filtro.indexOf(":");
        filtro = filtro.slice(++cont);

    }
    return filtro;
}


function validarAnyo(anyoFundacion) {

    let anyoValido = false;

    if (anyoFundacion >= seleccionDesdeAnyo && anyoFundacion <= seleccionHastaAnyo) anyoValido = true;

    return anyoValido;

}

function cargarSelectSeccion() {

    //Si hay contenido previo lo eliminamos 
    limpiarNodo(document.querySelector('select'));

    let secciones = [];

    //Segun la seleccion se cargan las secciones principales o infantiles
    if (seccionPpalActiva) secciones = seccionesPrincipales;
    else secciones = seccionesInfantiles;

    let select = document.querySelector('select');;

    for (let i = 0; i < secciones.length; i++) {

        let option = document.createElement('option');

        option.innerHTML = secciones[i];
        select.appendChild(option);
    }
}

//Recibe un nodo padre a partir del cual eliminamos todo su contenido
function limpiarNodo(elemento) {

    if (elemento.hasChildNodes()) {

        while (elemento.childNodes.length >= 1) {
            elemento.removeChild(elemento.firstChild);
        }
    }

}

function cambiarSeccion() {

    if (seccionPpalActiva) seccionPpalActiva = false;
    else seccionPpalActiva = true;

    cargarSelectSeccion();
    mostrarFallas();
}

function modificarSeccionBuscada() {

    mostrarFallas();
}

function obtenerDatos(datos) {

    //Obtiene las diferentes secciones:
    obtenerSecciones(datos);
    //Cargamos el selector de secciones de fallas
    cargarSelectSeccion();
    //Guardamos los datos del JSON en una variable global
    datosJSON = datos;
    //Mostramos fallas
    mostrarFallas();
    //Para testeo creamos puntuaciones en la BBDD
    //crearPtosFicticios();

}


function cierraVentanaEmergente() {

    let div = document.getElementById('fullScreen');
    let body = document.querySelector('body');

    body.removeChild(div);

    enableScroll();

}

function mostrarUbicacion() {

    let coordenadas = datosJSON.features[this.value].geometry.coordinates;

    coordenadas = convertirCoordenada(coordenadas);

    let divFullScreen = document.createElement('div');
    divFullScreen.setAttribute('id', 'fullScreen');
    divFullScreen.classList.add('opacidad');

    let divMapa = document.createElement('div');
    divMapa.setAttribute('id', 'map');

    let i = document.createElement('i');
    i.classList.add("far", "fa-times-circle");
    i.addEventListener('click', cierraVentanaEmergente);
    divFullScreen.appendChild(i);

    divFullScreen.appendChild(divMapa);
    document.querySelector('body').appendChild(divFullScreen);

    let y = window.scrollY;
    
    divFullScreen.style.top = y + 'px';

    disableScroll();
   
    let map = L.map('map').
        setView([coordenadas[0], coordenadas[1]],
            14);


    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
        maxZoom: 18
    }).addTo(map);

    L.marker([coordenadas[0], coordenadas[1]]).addTo(map);

    L.control.scale().addTo(map);

}

function disableScroll(){  
    var x = window.scrollX;
    var y = window.scrollY;
    window.onscroll = function(){ window.scrollTo(x, y) };
}

function enableScroll(){  
    window.onscroll = null;
}

function convertirCoordenada(coordenadas) {

    let firstProjection = '+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs';
    let secondProjection = '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs';

    nuevaCoordenada = proj4(firstProjection, secondProjection, coordenadas);

    return [nuevaCoordenada[1], nuevaCoordenada[0]];
}

function borrarContenido() {

    this.value = "";

    if (this.id == 'anyoDesde') seleccionDesdeAnyo = 0;
    if (this.id == 'anyoHasta') seleccionHastaAnyo = 3000;

}

function seleccionarAnyo() {

    if (this.value == '') {

        if (this.id == 'anyoDesde') this.value = 'Desde';
        if (this.id == 'anyoHasta') this.value = 'Hasta';

    } else {

        if (this.id == 'anyoDesde') seleccionDesdeAnyo = this.value;
        if (this.id == 'anyoHasta') seleccionHastaAnyo = this.value;

    }

    mostrarFallas();
}

//Para testeo de app introduciremos puntuaciones en Mongo
function crearPtosFicticios() {

    var url = '/api/puntuaciones';
    let ptos;
    let datos;
    let ip = 1000;
    let listaIdsFalla = new Set();

    //averiguamos todos los idFalla que existen en el JSON para asignarles puntuaciones
    for (let i = 0; i < datosJSON.features.length; i++) {

        listaIdsFalla.add(datosJSON.features[i].properties.id);

    }

    for (let id of listaIdsFalla) {

        for (let x = 0; x < 3; x++) {

            ip++;
            //Puntuamos del 1 al 5 de forma aletaroia
            ptos = Math.floor(Math.random() * (6 - 1)) + 1;
            datos = { idFalla: id, ip: ip, puntuacion: ptos };

            fetch(url, {
                method: 'POST',
                body: JSON.stringify(datos),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json())
                .catch(error => console.error('Error:', error));
        }
    }
}

function despliegaFormulario() {

    let form = document.getElementById('form');

    if (form.classList.contains('noVisible')) {

        form.classList.remove('noVisible');

    } else {

        form.classList.add('noVisible');
    }
}

function init() {

    obtenerJSON();
    seccionPpalActiva = true;
    seccionesPrincipales = [];
    seccionesInfantiles = [];
    seleccionHastaAnyo = 3000;
    seleccionDesdeAnyo = 0;
    idLabelPtos = 1;
    document.querySelector('input[value="principal"]').addEventListener('change', cambiarSeccion);
    document.querySelector('input[value="infantil"]').addEventListener('change', cambiarSeccion);
    document.querySelector('select').addEventListener('change', modificarSeccionBuscada);
    document.getElementById('anyoDesde').addEventListener('focus', borrarContenido);
    document.getElementById('anyoHasta').addEventListener('focus', borrarContenido);
    document.getElementById('anyoDesde').addEventListener('blur', seleccionarAnyo);
    document.getElementById('anyoHasta').addEventListener('blur', seleccionarAnyo);
    document.getElementById('hamburger').addEventListener('click', despliegaFormulario);
    getIP();


}

function fijarHeader() {

    if (screen.width > 1500) {

        // Get the header
        var header = document.querySelector('header');

        // Get the offset position of the navbar
        var sticky = header.offsetTop;

        if (window.pageYOffset > sticky) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }

    }

    

}

function getIP(json) {

    
    if (json != undefined) ipCliente = json.ip;

    
}


//VARIABLES GLOBALES
let datosMongo;
let datosJSON;
let seccionPpalActiva;
let seccionesPrincipales;
let seccionesInfantiles;
let seleccionDesdeAnyo;
let seleccionHastaAnyo;
let idLabelPtos; //La combinacion input-label de las estrellas de puntuacion requieren id distintos
let ipCliente;



/** OBJETO FALLA */
function Falla(idFalla = 0, ptosTotales = 0, vecesVotada = 0, media = 0, ip = '0') {

    this.idFalla = idFalla;
    this.ptosTotales = ptosTotales;
    this.vecesVotada = vecesVotada;
    this.mediaPtos = media;
    this.ip = ip;
}


window.addEventListener('scroll', fijarHeader);
window.addEventListener('load', init);
