window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    //console.log('Token from URL:', token)
    if (token) {
        localStorage.setItem('token', token);
        removeTokenFromUrl();
    } else{
        initApp();
    }
});

function removeTokenFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.pathname + url.search);
    initApp();
}

// --- Funciones de inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Cargar datos del cuidador
    loadCaretakerData(); 
    //Crear mascotas asignadas
    //Crear tis responsabilidades
    //Crear tus actividades
});
function initApp() {
    if (localStorage.getItem('token')) {
        // Cargar datos del cuidador
        createCaretakerCardBody();

    } else {
        console.error('No hay token de autenticación');
        window.location.href = 'login.html';
    }

};

async function loadCaretakerData() {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
    if (!token) {
        console.error('No hay token de autenticación');
        return;
    }
    try {
        const response = await fetch('/caretaker/get-caretaker', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const caretakerData = await response.json();
        console.log('Caretaker data:', caretakerData);
        return caretakerData;
        //updateCaretakerCard(caretakerData);
    } catch (error) {
        console.error('ERROR:', error);
    }
}





function updateCaretaker(caretakerId, updatedData) {
    fetch(`caretaker/update-caretaker`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user: { id: caretakerId },
            update: updatedData
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Caretaker updated:', data);
        // Actualizar la UI con los nuevos datos o manejar estados de éxito
    })
    .catch(error => console.error('Error updating caretaker:', error));
}
// --- Funciones de DOM ---
// Función para crear el cuerpo de la tarjeta del Caretaker ---
async function createCaretakerCardBody() {
    const caretakerData = await loadCaretakerData(); // Asegúrate de que esta función devuelva los datos o maneje correctamente la obtención de datos.
    if (!caretakerData) {
        console.error('No se pudo obtener la información del cuidador');
        return;
    }
    
    const cardBody = `
    <div class="card-caretaker">
        <img class="card-img-top" src="${caretakerData.profilePicture || '../img/caretaker.jpg'}" alt="Profile picture">
        <div class="card-body">
            <h4 class="card-title"><b>${caretakerData.username}</b></h4>
            <h5 class="card-text-status"><i>
                ${caretakerData.status}
            </i></h5>
            <br>
            <div class="card-body-bottom">
                <btn class="btn boxed-btn5" id="editProfileBtn" data-toggle="modal" data-target="#editProfileModal">
                    <i class="fa fa-pencil-alt" aria-hidden="true"></i>
                    <a>Editar perfil</a></btn>
                <br>
            </div>
        </div> 
    </div>
    `;
    document.getElementById('card-caretaker-section').innerHTML = cardBody;
};
