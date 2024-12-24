const URLTODOS = 'https://jsonfakery.com/movies/simple-paginate';
const MoviesList = document.getElementById("movies-list");
let Carrito = []; // cambiar a let para permitir reiniciar el array
const Busqueda = document.getElementById("busqueda");
const CarritoDescarga = document.getElementById("carritoDescarga");
const CarritoIcon = document.getElementById("carritoIcon");

Busqueda.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = event.target[0].value;
    buscadoraDeMovie(query);
});

// Evento para abrir y cerrar el carrito al hacer clic en el ícono
CarritoIcon.addEventListener("click", () => {
    if (CarritoDescarga.style.right === '0px') {
        CarritoDescarga.style.right = '-25vw';
    } else {
        CarritoDescarga.style.right = '0';
    }
});

function renderizarPelicula(titulo, poster, popularity, id, overview) {
    MoviesList.innerHTML += ` 
    <div class="movie-card"> 
        <div class="pelicula">
            <h2 class="titulo">${titulo}</h2> 
            <h3 class="id-pelicula">ID: ${id}</h2>
            <h3 class="popularity">POPULARIDAD: ${popularity}</h2>
        </div> 
        <div class="poster">
            <img src="${poster}" alt="poster de la pelicula"> 
        </div>
        <p>${overview}</p> 
        <button class="botonDescargar">Descargar Pelicula</button>
    </div>`;
}

function actualizadoraDeCarrito() {
    CarritoDescarga.innerHTML = "<h1>Tu Lista de Descargas</h1>"; // Limpiar el carrito
    Carrito.forEach((el, index) => {
        CarritoDescarga.innerHTML += `
        <div class="movie-card"> 
            <div class="pelicula">
                <h2 class="titulo">${el.titulo}</h2> 
            </div> 
            <div class="poster">
                <img src="${el.imagen}" alt="poster de la pelicula"> 
            </div>
            <button class="botonesEliminar" data-index="${index}">Quitar</button>
        </div>`;
    });
    CarritoDescarga.innerHTML += `<button id="completarDescarga">Completar descarga</button>`;

    agregarEventoEliminar();
    agregarEventoCompletarDescarga();
}

function agregarEventoBoton() {
    const BotonesDescargar = document.getElementsByClassName("botonDescargar");
    const BotonesDescargarArray = Array.from(BotonesDescargar);

    BotonesDescargarArray.forEach(el => {
        el.addEventListener("click", (e) => {
            const id = e.target.parentElement.children[0].children[1].innerText;
            const titulo = e.target.parentElement.children[0].children[0].innerText;
            const imagen = e.target.parentElement.children[1].children[0].src;

            const peliculaExiste = Carrito.some(pelicula => pelicula.id === id);
            if (!peliculaExiste) {
                Carrito.push({
                    id: id,
                    titulo: titulo,
                    imagen: imagen
                });
                actualizadoraDeCarrito(); // Actualizar el carrito después de agregar

                // Mostrar SweetAlert cuando se agrega una película al carrito
                Swal.fire({
                    title: "¡Película agregada a su lista!",
                    icon: "success",
                    draggable: true
                });
            } else {
                Swal.fire({
                    title: "La película ya está en su lista.",
                    icon: "info",
                    draggable: true
                });
            }
        });
    });
}

function agregarEventoEliminar() {
    const BotonesEliminar = document.getElementsByClassName("botonesEliminar");
    const BotonesEliminarArray = Array.from(BotonesEliminar);
    BotonesEliminarArray.forEach(el => {
        el.addEventListener("click", (e) => {
            const index = e.target.getAttribute('data-index');
            Carrito.splice(index, 1); // Eliminar la película del carrito
            actualizadoraDeCarrito(); // Actualizar el carrito después de eliminar
        });
    });
}

function agregarEventoCompletarDescarga() {
    const CompletarDescarga = document.getElementById("completarDescarga");
    CompletarDescarga.addEventListener("click", () => {
        Swal.fire({
            title: "Para completar la descarga es necesario que nos de un email",
            input: "email",
            inputPlaceholder: 'Ingrese su email',
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            confirmButtonText: 'Confirmar'
        }).then((result) => {
            if (result.isConfirmed && result.value !== "") {
                console.log(result.value);
                Carrito = []; // reiniciar el carrito después de la compra
                actualizadoraDeCarrito();
                Swal.fire({
                    title: "¡Email recibido, muchas gracias!",
                    text: "Le enviaremos su descarga a la dirección email ingresada.",
                    icon: "success"
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                Swal.fire({
                    icon: "error",
                    title: "No se ha ingresado ningún email",
                });
            }
        });
    });
}

async function fetchMovies() {
    try {
        const response = await fetch(URLTODOS);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        localStorage.setItem('movies', JSON.stringify(data.data)); // Guardar películas en localStorage
        return data.data;
    } catch (error) {
        console.error("Error al buscar películas:", error);
    }
}

function buscadoraDeMovie(query) {
    MoviesList.innerHTML = ''; // Limpiar la lista de películas
    const moviesData = JSON.parse(localStorage.getItem('movies'));
    const filtradoraDeMovies = moviesData.filter(movie => movie.original_title.toLowerCase().includes(query.toLowerCase()));

    if (filtradoraDeMovies.length === 0) {
        alert("No hay películas bajo ese nombre");
    } else {
        filtradoraDeMovies.forEach(movie => {
            renderizarPelicula(movie.original_title, movie.poster_path, movie.popularity, movie.movie_id, movie.overview);
        });
        agregarEventoBoton();
    }
}

async function llamadoraDeMovies() {
    try {
        let moviesData = JSON.parse(localStorage.getItem('movies'));
        if (!moviesData) {
            moviesData = await fetchMovies();
        }

        if (moviesData) {
            moviesData.forEach(movie => {
                renderizarPelicula(movie.original_title, movie.poster_path, movie.popularity, movie.movie_id, movie.overview);
            });
            agregarEventoBoton();
        }
    } catch (error) {
        console.error("Todo mal", error);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await llamadoraDeMovies();
});
