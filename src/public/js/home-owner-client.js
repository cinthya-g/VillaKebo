
// Constantes
PROFILE_PHOTO_S3 = "https://vk-profile-photos.s3.amazonaws.com/";


// --- Funciones de token ---
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    //console.log('Token from URL:', token)
    if (token) {
        localStorage.setItem('token', token);
        removeTokenFromUrl();
    }
});

function removeTokenFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.pathname + url.search);
}

// --- Funciones de inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    createOwnerCardBody(); 
    // añadir carga de mascotas
    // añadir carga de reservaciones
    // notificaciones?
});


// --- Funciones API ---
// Obtener datos del dueño loggeado
async function getOwnerData() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/owner/get-owner', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        return null;
    }
}

// Editar datos del usuario
async function editOwnerData(data) {
    const token = localStorage.getItem('token');
    fetch('/owner/update-owner', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ update: data })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#editProfileModal').modal('hide');
        updateCardOwnerData(data);
    }).catch(error => {
        console.error('Error:', error);
    });
}


// Cargar nueva foto de perfil
async function uploadProfilePicture(file) {
    const token = localStorage.getItem('token');
    // Obtener el id del usuario
    const ownerData = await getOwnerData();
    if (!ownerData) {
        console.error('No se pudo obtener la información del dueño');
        return;
    }
    const ownerID = ownerData._id;
    const formData = new FormData();
    formData.append('ownerID', ownerID);
    formData.append('photo', file);

    fetch('/owner/upload-photo', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#editProfileModal').modal('hide');
        document.getElementById('displayPicture').src = PROFILE_PHOTO_S3 + data.profilePicture; 
    }).catch(error => {
        console.error('Error:', error);
    });
};




// --- Funciones de DOM ---
// --- Función para crear el cuerpo de la tarjeta del Dueño ---
async function createOwnerCardBody() {
    const ownerData = await getOwnerData();
    if (!ownerData) {
        console.error('No se pudo obtener la información del dueño');
        return;
    }
    const cardBody = `
    <div class="card-owner">
        <img class="card-img-top" src="${PROFILE_PHOTO_S3 + ownerData.profilePicture}" alt="Profile picture" id="displayPicture">
        <div class="card-body">
            <h4 class="card-title" id="displayUsername"><b>${ownerData.username}</b></h4>
            <h5 class="card-text-status" id="displayStatus"><i>
                ${ownerData.status}
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
    document.getElementById('card-owner-section').innerHTML = cardBody;
};

// --- Fabricar el contenido del MODAL DE EDITAR PERFIL ---
async function createEditProfileModal() {
    const ownerData = await getOwnerData();
    // Si el email termina con @gmail.com, no se puede editar
    const emailDisabled = ownerData.email.endsWith('@gmail.com') ? 'disabled' : '';
    const modalContent = `
    <div class="modal-body">
        <div class="row">
            <!-- Left section for form inputs -->
            <div class="col-md-8">
                <form>
                    <div class="form-group">
                        <h5 for="editedUsername">Nombre de usuario</h5>
                        <input type="text" class="form-control" id="editedUsername" placeholder="${ownerData.username}">
                    </div>
                    <div class="form-group">
                        <h5 for="user-status">Estado</h5>
                        <textarea class="form-control" id="editedStatus" rows="2" maxlength="250" placeholder="${ownerData.status}" style="resize: none;"></textarea>
                    </div>
                    <div class="form-group">
                        <h5 for="user-status">E-mail</h5>
                        <input type="text" class="form-control" id="editedEmail" placeholder="${ownerData.email}" ${emailDisabled}>
                    </div>
                </form>
            </div>
            <!-- Right section for profile picture -->
            <div class="col-md-4 text-center">
                <img src="${PROFILE_PHOTO_S3 + ownerData.profilePicture}" alt="Profile Picture" class="img-fluid change-picture" id="profilePictureOwner">
                <input type="file" id="imageInputOwner" accept="image/*" style="display: none;">
                <btn class="btn boxed-btn5 mt-4" id="editPictureBtn">
                    <i class="fa fa-picture-o" aria-hidden="true"></i>
                    <a>Cambiar foto</a></btn>
            </div>
        </div>
    </div>`;
    document.getElementById('editProfileModalContent').innerHTML = modalContent;

};



// --- Eventos DOM ---
// Abrir modal de editar perfil
document.addEventListener('DOMContentLoaded', function () {
    $('#editProfileModal').on('show.bs.modal', function () {
        createEditProfileModal();
    });
});

// EVENT DELEGATION: Subir nueva imagen de perfil
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('editProfileModalContent');
    container.addEventListener('click', function (event) {
        // Verifica si el elemento que disparó el evento es el de "Cambiar foto"
        if (event.target.id === 'editPictureBtn' || event.target.closest('#editPictureBtn')) {
            // Obtener la fotografía seleccionada
            document.getElementById('imageInputOwner').click();
            // Cambiarla en la vista previa
            document.getElementById('imageInputOwner').addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('profilePictureOwner').src = e.target.result; // actualizar vista previa
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });
            
        }
    });
});

// Guardar datos editados del dueño
document.getElementById('saveChangesProfileBtn').addEventListener('click', async function(event) {
    event.preventDefault();

    const editedUsername = document.getElementById('editedUsername').value;
    const editedStatus = document.getElementById('editedStatus').value;
    const editedEmail = document.getElementById('editedEmail').value;
    const editedPicture = document.getElementById('imageInputOwner').files[0];

    let updateData = {};

    if (editedUsername.trim() !== '') updateData.username = editedUsername;
    if (editedStatus.trim() !== '') updateData.status = editedStatus;
    if (editedEmail.trim() !== '') updateData.email = editedEmail;

    // Solo procede si hay algo que actualizar
    if (Object.keys(updateData).length > 0) {
        await editOwnerData(updateData);
    } 
    // Actualizar foto de perfil si se seleccionó una nueva
    if (editedPicture) {
        await uploadProfilePicture(editedPicture);
    }
    else {
        document.getElementById('noChangesAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            No hay datos por actualizar
        </div>
        `;
        // Quitar el mensaje de alerta
        setTimeout(() => {
            document.getElementById('noChangesAlert').innerHTML = '';
        }, 2000);
    }
});

function updateCardOwnerData(data) {
    // Actualiza los elementos del DOM (texto) con los nuevos datos
    document.getElementById('displayUsername').innerHTML = `<b>${data.username}</b>`; 
    document.getElementById('displayStatus').innerHTML = `<i>${data.status}</i>`; 
}


// Evento de prueba para cambiar imagen y probar previsualización
/*
document.getElementById('editPictureBtn').addEventListener('click', function() {
    document.getElementById('imageInputOwner').click(); // Activar el input oculto
});


document.getElementById('imageInputOwner').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('profilePictureOwner').src = e.target.result; // actualizar vista previa
        }
        reader.readAsDataURL(this.files[0]); 
    }
});
*/

// Expediente
document.getElementById('newPdfInput').addEventListener('change', function() {
    if (this.files && this.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.querySelector('iframe').src = e.target.result; // Actualiza el src del iframe
        };
        reader.readAsDataURL(this.files[0]); // Lee el archivo seleccionado como URL
    }
});


// Actividades test
document.addEventListener('DOMContentLoaded', function() {
    addActivity(); // Añade la primera actividad por defecto al cargar el modal
});

function addActivity() {
    const activityList = document.getElementById('activityList');
    const activityDiv = document.createElement('div');
    activityDiv.className = "activity-entry"; // Añadimos una clase para facilitar la identificación
    activityDiv.innerHTML = `
        <div class="form-group">
            <h5>Título</h5>
            <input type="text" class="form-control" placeholder="Título de la actividad">
        </div>
        <div class="form-group">
            <h5>Descripción</h5>
            <input type="text" class="form-control" placeholder="Describe brevemente la actividad">
        </div>
        <div class="form-group">
            <h5>Frecuencia</h5>
            <select class="form-control" size="4">
                <option value="op1">1 vez al día</option>
                <option value="op2">2 veces al día</option>
                <option value="op3">3 veces al día</option>
                <option value="op4">Alternando días</option>
                <option value="op5">Cada semana</option>
                <option value="op6">De 2 a 4 veces a la semana</option>
                <option value="op7">Cuando sea necesario</option>
                <option value="op8">Revisar expediente</option>

            </select>
        </div>
        <hr>
    `;
    activityList.appendChild(activityDiv);
}

function removeActivity() {
    const activities = document.querySelectorAll('.activity-entry');
    if (activities.length > 1) { // Asegurarse de dejar al menos una actividad
        activities[activities.length - 1].remove();
    }
}

function submitActivities() {
    // Recopila datos de todas las actividades y haz algo con ellos (enviar al servidor, procesar, etc.)
    console.log('Enviar actividades');
}

