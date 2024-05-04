// Constantes
PROFILE_PHOTO_S3 = "https://vk-profile-photos.s3.amazonaws.com/";


// --- Funciones de token ---
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('GoogleAccount', true);
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
function initApp() {
    if (localStorage.getItem('token')) {
        createOwnerCardBody();
        createPetsCards();
    } else {
        console.error('No hay token de autenticación');
        window.location.href = 'login.html';
    }
    
};

// --- Obtener la foto de perfil correcta de acuerdo al tipo de cuenta ---
function isItGoogleAccount(obj) {
    return localStorage.getItem('GoogleAccount') ? obj.profilePicture : PROFILE_PHOTO_S3 + obj.profilePicture;
};


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

// Editar datos del dueño
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

// Cargar nueva foto de perfil del dueño
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
        document.getElementById('displayPicture').src = isItGoogleAccount(data);
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Función que recupera las mascotas del dueño
async function getOwnerPets() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/owner/get-pets-by-owner', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
};

// Función que recupera los datos de una mascota por ID
async function getPetData(petID) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/owner/get-pet/${petID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
};

// Editar datos de una mascota
async function editPetData(petID, updateData) {
    const token = localStorage.getItem('token');
    fetch(`/owner/update-pet`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ petID: petID, update: updateData })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#editPetModal').modal('hide');
        createPetsCards();
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Editar foto de perfil de una mascota
async function uploadPetPicture(petID, file) {
    const token = localStorage.getItem('token');

    const ownerData = await getOwnerData();
    const ownerID = ownerData._id;

    const formData = new FormData();
    formData.append('ownerID', ownerID);
    formData.append('petID', petID);
    formData.append('photo', file);

    fetch('/owner/upload-pet-photo', {
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
        $('#editPetModal').modal('hide');
        createPetsCards();
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Eliminar mascota por ID a través del modal
async function deletePet(petID) {
    console.log('Pet ID:', petID);
    const token = localStorage.getItem('token');
    fetch(`/owner/delete-pet/${petID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#deletePetModal').modal('hide');
        createPetsCards();
    }).catch(error => {
        console.error('Error:', error);
    });
};




// --- Funciones de DOM ---
// Función para crear el cuerpo de la tarjeta del Dueño ---
async function createOwnerCardBody() {
    const ownerData = await getOwnerData();
    if (!ownerData) {
        console.error('No se pudo obtener la información del dueño');
        return;
    }
    
    const cardBody = `
    <div class="card-owner">
        <img class="card-img-top" src="${isItGoogleAccount(ownerData)}" alt="Profile picture" id="displayPicture">
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

// Fabricar el contenido del MODAL DE EDITAR PERFIL ---
async function createEditProfileModal() {
    const ownerData = await getOwnerData();
    // Si es cuenta de google, no se pued editar el mail ni la foto
    const inputDisabled = localStorage.getItem('GoogleAccount') ? 'disabled' : '';
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
                        <input type="text" class="form-control" id="editedEmail" placeholder="${ownerData.email}" ${inputDisabled}>
                    </div>
                </form>
            </div>
            <!-- Right section for profile picture -->
            <div class="col-md-4 text-center">
                <img src="${isItGoogleAccount(ownerData)}" alt="Profile Picture" class="img-fluid change-picture" id="profilePictureOwner">
                <input type="file" id="imageInputOwner" accept="image/*" style="display: none;">
                <button class="btn boxed-btn5 mt-4" id="editPictureBtn" ${inputDisabled}>
                    <i class="fa fa-image" aria-hidden="true"></i>
                    <a>Cambiar foto</a></button>
            </div>
        </div>
    </div>`;
    document.getElementById('editProfileModalContent').innerHTML = modalContent;

};

// Fabricar las tarjetas de mascotas dependiendo de los datos obtenidos
async function createPetsCards() {
    const petsData = await getOwnerPets();
    if (!petsData) {
        console.error('No se pudo obtener la información de las mascotas');
        return;
    }
    const petsSection = document.getElementById('card-pet-section');
    let cards = '';
    if (petsData.length === 0) {
        cards = `
        <div class="col-md-12">
            <div class="card-pet">
                <div class="card-body">
                    <h4 class="card-title"><b>No tienes mascotas registradas</b></h4>
                    <ul class="list-group
                    list-group-flush">
                    </ul>
                </div>
            </div>
        </div>
        `;
    } else {
        petsData.forEach(pet => {
            cards += `
            <div class="col-md-4">
                <div class="card-pet">
                    <img class="card-img-top" src="${PROFILE_PHOTO_S3 + pet.profilePicture}" alt="Profile picture">
                    <div class="card-body">
                        <h4 class="card-title"><b>${pet.name}</b></h4>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item">${pet.breed} de ${pet.age} años</li>
                            <li class="list-group-item">
                                <btn class="btn boxed-btn6" data-toggle="modal" data-target="#petRecordModal">
                                    <i class="fa fa-upload" aria-hidden="true"></i>
                                    <a>Expediente</a></btn>
                            </li>
                            <li class="list-group-item">
                                <btn class="btn boxed-btn-round-green mr-3" onclick="createEditPetModal('${pet._id}')"
                                    data-target="#editPetModal" data-toggle="modal"
                                ><i class="fa fa-edit" aria-hidden="true"></i>
                                    <a></a></btn>
                                <btn class="btn boxed-btn-round-red ml-3" onclick="createDeletePetModal('${pet._id}')"
                                    data-target="#deletePetModal" data-toggle="modal"
                                ><i class="fa fa-eraser" aria-hidden="true"></i>
                                    <a></a></btn>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            `;
        });
}

    petsSection.innerHTML = cards;
};

// Función para crear el contenido del MODAL DE EDITAR MASCOTA
async function createEditPetModal(petID) {
    const petData = await getPetData(petID);
    if (!petData) {
        console.error('[Editar mascota] No se pudo obtener la información de la mascota: ', petID);
        return;
    }
    const modalContent = `
    <div class="modal-body">
        <div class="row">
            <!-- Left section for form inputs -->
            <div class="col-md-8">
                <form>
                    <div class="form-group">
                        <h5 for="editedPetName">Nombre</h5>
                        <input type="text" class="form-control" id="editedPetName" placeholder="${petData.name}">
                    </div>
                    <div class="form-group">
                        <h5 for="editedAge">Edad</h5>
                        <input type="number" min="0" max="25" class="form-control" id="editedAge" placeholder="${petData.age}">
                    </div>
                    <div class="form-group">
                        <h5 for="editedBreed">Raza</h5>
                        <input type="text" class="form-control" id="editedBreed" placeholder="${petData.breed}">
                    </div>
                    
                </form>
            </div>
            <!-- Right section for profile picture -->
            <div class="col-md-4 text-center">
                <img src="${PROFILE_PHOTO_S3 + petData.profilePicture}" alt="Pet Picture" class="img-fluid change-picture" id="profilePicturePet">
                <input type="file" id="imageInputPet" accept="image/*" style="display: none;">
                <btn class="btn boxed-btn5 mt-4" id="editPetPictureBtn">
                    <i class="fa fa-picture-o" aria-hidden="true"></i>
                    <a>Cambiar foto</a></btn>
            </div>
        </div>
    </div>
    `;
    document.getElementById('edit-pet-body-modal').innerHTML = modalContent;
    const saveBtn = `<button type="button" class="btn boxed-btn-round-accept" onclick="savePet('${petData._id}')">Guardar cambios</button>`;
    document.getElementById('saveModifiedPetBtn').innerHTML = saveBtn;
}


// Función para crear el contenido del MODAL DE ELIMINAR MASCOTA
async function createDeletePetModal(petID) {
    const petData = await getPetData(petID);
    if (!petData) {
        console.error('[Eliminar mascota] No se pudo obtener la información de la mascota: ', petID);
        return;
    }
    const modalContent = `
    <div class="modal-header">
        <h3 class="modal-title" id="deletePetModalLabel">¿Eliminar mascota?</h3>
        <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
    <div class="modal-body">
        <div class="row">
            <!-- Right section for profile picture -->
            <div class="col-md-12 text-center">
                <img src="${PROFILE_PHOTO_S3 + petData.profilePicture}" alt="Pet Picture" class="img-fluid change-picture mb-2" >
                <h5>Si eliminas a ${petData.name}, <br> sus reservaciones se cancelarán.</h5>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        
        <button type="button" class="btn boxed-btn-round-green" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn boxed-btn-round-cancel" onclick="deletePet('${petData._id}')">Eliminar</button>
    </div>
    `;
    document.getElementById('delete-pet-content').innerHTML = modalContent;
};




// --- Eventos DOM ---
// TEMPORAL: Cerrar sesión (no-google)
document.getElementById('logoutBtn').addEventListener('click', function() {
    localStorage.removeItem('token');
    localStorage.removeItem('GoogleAccount');
    window.location.href = '../index.html';
});

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

// EVENT DELEGATION: Subir nueva imagen de perfil de mascota
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('edit-pet-body-modal');
    container.addEventListener('click', function (event) {
        // Verifica si el elemento que disparó el evento es el de "Cambiar foto"
        if (event.target.id === 'editPetPictureBtn' || event.target.closest('#editPetPictureBtn')) {
            // Obtener la fotografía seleccionada
            document.getElementById('imageInputPet').click();
            // Cambiarla en la vista previa
            document.getElementById('imageInputPet').addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('profilePicturePet').src = e.target.result; // actualizar vista previa
                    }
                    reader.readAsDataURL(this.files[0]);
                }
            });
            
        }
    });
});



// --- Eventos DOM onclick ---
// Guardar los datos editados de la mascota por ID
async function savePet(petID) {
    const editedPetName = document.getElementById('editedPetName').value;
    const editedAge = document.getElementById('editedAge').value;
    const editedBreed = document.getElementById('editedBreed').value;
    const editedPicture = document.getElementById('imageInputPet').files[0];

    let updateData = {};

    if (editedPetName.trim() !== '') updateData.name = editedPetName;
    if (editedAge.trim() !== '') updateData.age = editedAge;
    if (editedBreed.trim() !== '') updateData.breed = editedBreed;

    if (Object.keys(updateData).length > 0) {
        await editPetData(petID, updateData);
    } 
    if (editedPicture) {
        await uploadPetPicture(petID, editedPicture);
    }
    else {
        document.getElementById('noPetChangesAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            No hay datos por actualizar
        </div>
        `;
        setTimeout(() => {
            document.getElementById('noPetChangesAlert').innerHTML = '';
        }, 2000);
    }
};





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

