let globalMarker = undefined
const datos = cargarDatos()
let mapa
function crearMapa() {
    const mapa = L.map('mapa').setView([40.416775, -3.703790], 5);
    

    L.tileLayer('https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=NVlvBbTlvbFWP7KKrFmF', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    }).addTo(mapa);

    return mapa;
}

function retornaPopUp(elemento){
    const sep = "<br />"
    let retorna = ""
    retorna += '<div class = "popup">'
    retorna += "<b>Nombre: </b>" + elemento.nombre + sep
    if(elemento.address){
        retorna += "<b>Dirección: </b>" + elemento.address + sep
    }
    elemento.productos.forEach((producto, i) => {
        let display = i < 10 ? "block" : "none"
        retorna += '<div class="pagina' + Math.floor(i/10) + '_' + elemento.museo +'" style="display:' + display + ';">'
        retorna += "<hr>"
        retorna += '<button onclick="addMarker(' + producto.id + ')">' + producto.nombre + "</button>" + sep
        if(producto.materiales[0]){
            retorna += "Materiales: ["
            producto.materiales.forEach((materialI, i) => {
                retorna += '<a href=# class="material">' + materialI.nombre + "</a>"
                retorna += '<img class = "imge" src="imagenes/materiales/' + materialI.nombre + '.jpg">'
                if(i != producto.materiales.length - 1) retorna += ", "
            })
            retorna += "]" + sep
        }
        if(producto.tecnicas[0]){
            retorna += "Tecnicas: ["
            producto.tecnicas.forEach((productoI, i) => {
                retorna += '<a href=# class="tecnica">' + productoI.nombre + "</a>"
                retorna += '<img class = "imge" src="imagenes/tecnicas/' + productoI.nombre + '.jpg">'
                if(i != producto.tecnicas.length - 1) retorna += ", "
            })
            retorna += "]" + sep
        }
        if(i%10 == 9){
            if(i>= 10){
                retorna += '<button onclick="anterior(' + Math.floor(i/10) + ',' + elemento.museo + ')">Anterior</button>' + sep
            }
            if(i!= elemento.productos.length){
                retorna += '<button onclick="siguiente(' + Math.floor(i/10) + ',' + elemento.museo + ')">Siguiente</button>' + sep
            }
        }
        retorna += "</div>"
    })
    retorna += "</div>"
    return retorna
}

function objetoHTML(producto){
    const sep = "<br/>"
    let retorna = "<div>"
    retorna += "<b>Nombre: </b>" + producto.nombre + sep
    retorna += "<b>Desde: </b>" + producto.desde + " <b>Hasta: </b>" +  producto.hasta + sep
    if(producto.materiales[0]){
        retorna += "Materiales: ["
        producto.materiales.forEach((materialI, i) => {
            retorna += '<a href=# class="material">' + materialI.nombre + "</a>"
            if(i != producto.materiales.length - 1) retorna += ", "
        })
        retorna += "]" + sep
    }
    if(producto.tecnicas[0]){
        retorna += "Tecnicas: ["
        producto.tecnicas.forEach((productoI, i) => {
            retorna += '<a href=# class="tecnica">' + productoI.nombre + "</a>"
            if(i != producto.tecnicas.length - 1) retorna += ", "
        })
        retorna += "]" + sep
    }
    retorna += "</div>"
    return retorna
}

function recargarMapa(museos, mapa, markers){
    if(markers.length){
        markers.forEach(marker => {
            mapa.removeLayer(marker)
        })
    }
    markers = []
    if (museos.length == 0) return markers;
    museos.forEach(elem => {
        markers.push(L.marker([elem.latitud, elem.longitud], {icon: museoIcon}).bindPopup(retornaPopUp(elem)).addTo(mapa));
    })

    return markers
}

const museoIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/236/236981.png',

    iconSize:     [30, 30] // size of the icon
});

const digIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2826/2826202.png',

    iconSize:     [30, 30] // size of the icon
});

function cargarDatos(){

    const datos = {
        materiales : returnMateriales(), 
        datos_museos: returnDatos_museos(), 
        museos: returnMuseos(), 
        tecnicas: returnTecnicas()
    }
    datos.datos_museos = datos.datos_museos.map(producto => {
        const materialesA = producto.material  ? producto.material.split(",").map(materialID => datos.materiales.filter(id => id.id == materialID)[0]) : []
        const tecnicasA = producto.tecnica  ? producto.tecnica.split(",").map(materialID => datos.tecnicas.filter(id => id.id == materialID)[0]) : []
        return {
            materiales : materialesA,
            tecnicas: tecnicasA,
            ...producto
        }
    })
    datos.museos = datos.museos.map(museo => {
        const productos = datos.datos_museos.filter(el => el.museo == museo.museo)
        return {
            productos,
            ...museo
        }
    })
    return datos;
}

function siguiente(i, elemento){
    document.querySelectorAll(".pagina"+i+"_"+elemento).forEach(a=> a.style.display = "none")
    document.querySelectorAll(".pagina"+(i+1)+"_"+elemento).forEach(a=>a.style.display = "block")
}

function anterior(i, elemento){
    document.querySelectorAll(".pagina"+i+"_"+elemento).forEach(a=> a.style.display = "none")
    document.querySelectorAll(".pagina"+(i-1)+"_"+elemento).forEach(a=>a.style.display = "block")
}

function filtra(el){
    const provincia = document.getElementById("selecciona").value
    const materiealSelec = document.getElementById("material").value
    const tecnicaSelec = document.getElementById("tecnica").value
    if(!el.nombre.toUpperCase().includes(document.getElementById("nombreMuseo").value.toUpperCase())) return false
    if(!el.address.match(provincia+"[0-9]{3}")) return false
    
    if(tecnicaSelec){
        if(el.productos.filter(a => a.tecnicas.filter(b => b ? b.nombre == tecnicaSelec: false).length).length == 0) return false
    }
    if(materiealSelec){
        if(el.productos.filter(a => a.materiales.filter(b => b ? b.nombre == materiealSelec: false).length).length == 0) return false
    }
    
    
    return true
}

function addMarker(idProd){
    if(globalMarker){
        mapa.removeLayer(globalMarker)
    }
    const producto = datos.datos_museos.filter(a => idProd == a.id)[0]
    console.log(producto)
    const coordenadas = producto ? [producto.latitud, producto.longitud] : [0,0]
    mapa.setView(coordenadas, 7)
    globalMarker = L.marker(coordenadas, {icon: digIcon}).bindPopup(objetoHTML(producto)).addTo(mapa)

}

window.onload = () => {
    let markers = [];
    mapa = crearMapa()
    markers = recargarMapa(datos.museos, mapa, markers)
    document.getElementById("nombreMuseo").addEventListener("input", textFilter => {
        const datos2 = textFilter ? datos.museos.filter(filtra) : datos.museos.filter(filtra)       
        [mapa , markers] = recargarMapa(datos2, mapa, markers)
        markers = recargarMapa(datos2, mapa, markers)
    })

    document.getElementById("selecciona").addEventListener("change", textFilter => {
        const datos2 = textFilter ? datos.museos.filter(filtra) : datos.museos.filter(filtra)      
        [mapa , markers] = recargarMapa(datos2, mapa, markers)
        markers = recargarMapa(datos2, mapa, markers)
    })

    document.getElementById("material").addEventListener("change", textFilter => {
        const datos2 = textFilter ? datos.museos.filter(filtra) : datos.museos.filter(filtra)      
        [mapa , markers] = recargarMapa(datos2, mapa, markers)
        markers = recargarMapa(datos2, mapa, markers)
    })

    document.getElementById("tecnica").addEventListener("change", textFilter => {
        const datos2 = textFilter ? datos.museos.filter(filtra) : datos.museos.filter(filtra)  
        [mapa , markers] = recargarMapa(datos2, mapa, markers)
        markers = recargarMapa(datos2, mapa, markers)
    })
}