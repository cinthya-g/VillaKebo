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
        createReservationCards();
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

// Crear mascota
async function createPet(data) {
    const token = localStorage.getItem('token');
    fetch('/owner/create-pet', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#createPetModal').modal('hide');
        createPetsCards();
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Obtener el expediente de una mascota
async function getPetRecord(petID) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/owner/get-record/${petID}`, {
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

// Subir un nuevo expediente para la mascota
async function uploadPetRecord(petID, file) {
    const token = localStorage.getItem('token');

    const ownerData = await getOwnerData();
    const ownerID = ownerData._id;

    const formData = new FormData();
    formData.append('ownerID', ownerID);
    formData.append('petID', petID);
    formData.append('pdf', file);

    fetch('/owner/upload-record', {
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
        $('#petRecordModal').modal('hide');
    }).catch(error => {
        console.error('Error:', error);
    });

}

// Obtener las reservaciones del dueño
async function getOwnerReservations() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/owner/get-reservations-by-owner', {
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

// Obtener las actividades de una reservación
async function getReservationActivities(reservationID) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/owner/get-activities-by-reservation/${reservationID}`, {
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

// Obtener el perfil del cuidador por el ID de la reservacion
async function getCaretakerProfile(reservationID) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/owner/get-assigned-caretaker/${reservationID}`, {
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

};

// Cancelar reservación por ID
async function cancelReservation(reservationID) {
    const token = localStorage.getItem('token');
    fetch(`/owner/cancel-reservation/${reservationID}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }
    ).then(data => {
        $('#deleteReservation').modal('hide');
        createReservationCards();
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Crear una reservación nueva
async function createReservation(data) {
    const token = localStorage.getItem('token');
    return fetch('/owner/create-reservation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        return data;
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Crear actividades individuales para una reservación a partir de un objeto de objetos
async function uploadActivities(reservationID, activitiesObj) {
    const token = localStorage.getItem('token');
    const activitiesArray = Object.values(activitiesObj);
    // El endpoint funciona al enviar una actividad individual entonces se itera el arreglo
    activitiesArray.forEach(activity => {
        fetch('/owner/create-activity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
                reservationID: reservationID,
                title: activity.title,
                description: activity.description,
                frequency: activity.frequency
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }).then(data => {
            console.log("Activity saved:",  data);
        }).catch(error => {
            console.error('Error:', error);
        });
    });
    console.log('Activities uploaded');

};

// Función para confirmar la reservación y añadir un caretaker aleatorio
async function confirmReservation(reservationID) {
    const token = localStorage.getItem('token');
    fetch('/owner/confirm-reservation', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reservationID: reservationID })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        $('#addActivitiesModal').modal('hide');
        createReservationCards();
    }).catch(error => {
        console.error('Error:', error);
    });
}






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
                                <btn class="btn boxed-btn6" onclick="createRecordModal('${pet._id}')"
                                     data-toggle="modal" data-target="#petRecordModal">
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

// Función para crear el contenido del MODAL DE EXPEDIENTE DE LA MASCOTA
async function createRecordModal(petID) {
    const petData = await getPetData(petID);
    if (!petData) {
        console.error('[Expediente] No se pudo obtener la información de la mascota: ', petID);
        return;
    }
    const record = await getPetRecord(petID);
    const recordURL = record.url;

    let modalContent = '';
    // Si el string de url termina en null, poner un div con un mensaje de que no hay expediente
    if (recordURL.endsWith('null')) {
        modalContent = `
        <div class="row">
            <div class="col-md-8">
                <h5 id="noRecordMessage">Parece que no has subido ninguno aún.<h5>
                <iframe id="recordFrame" style="width: 100%; height: 600px;" frameborder="0"></iframe>
            </div>
            <!-- Right section for upload new PDF -->
            <div class="col-md-4 text-center">
                <input type="file" id="newPdfInput" accept="application/pdf" style="display: none;">
                <button class="btn boxed-btn5 mt-4" id="updateRecordBtn">
                    <i class="fa fa-upload" aria-hidden="true"></i>
                    Actualizar
                </button>
                <button class="btn boxed-btn-round-accept mt-4" id="saveRecordBtn" onclick="savePetRecord('${petData._id}')">
                    <i class="fa fa-save" aria-hidden="true"></i>
                    Guardar
                </button>
                <div id="noRecordAlert" class="mt-4">
                <div>
            </div>
            
        </div>
        `;
    } else {
        modalContent = `
        <div class="row">
            <div class="col-md-8">
                <iframe id="recordFrame" src="${recordURL}" style="width: 100%; height: 600px;" frameborder="0"></iframe>
            </div>
            <!-- Right section for upload new PDF -->
            <div class="col-md-4 text-center">
                <input type="file" id="newPdfInput" accept="application/pdf" style="display: none;">
                <button class="btn boxed-btn5 mt-4" id="updateRecordBtn">
                    <i class="fa fa-upload" aria-hidden="true"></i>
                    Actualizar
                </button>
                <button class="btn boxed-btn-round-accept mt-4" id="saveRecordBtn" onclick="savePetRecord('${petData._id}')">
                    <i class="fa fa-save" aria-hidden="true"></i>
                    Guardar
                </button>
                <div id="noRecordAlert" class="mt-4">
                <div>
            </div>
            
        </div>
        `;
    }
    
    document.getElementById('record-modal-content').innerHTML = modalContent;
}; 

// Función para crear las tarjetas de las reservaciones
async function createReservationCards() {
    const reservationsData = await getOwnerReservations();
    if (!reservationsData) {
        console.error('No se pudo obtener la información de las reservaciones');
        return;
    }
    const reservationsSection = document.getElementById('reservation-cards-body');
    let cards = '';
    if (reservationsData.length <= 0) {
        cards = `
        <h3><b>No tienes reservaciones activas</b></h3>
        `;
    } else {
        for(const reservation of reservationsData) {

            const petData = await getPetData(reservation.petID);
            const activitiesSection = await createActivitiesSection(reservation);
            cards += `
            <h3 class="card-title"><b>${petData.name}</b></h3>
            <ul class="list-group list-group-flush">
                <li class="list-group-item"><h5>${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}</h5></li>
                <li class="list-group-item">
                    <h4><b>Actividades:</b></h4>
                    ${activitiesSection}
                </li>
                <li class="list-group-item">                                                
                    <h5><btn class="btn boxed-btn6" onclick="createCaretakerProfileModal('${reservation._id}')"
                        data-toggle="modal" data-target="#caretakerProfilePreview">
                        <i class="fa fa-address-card mr-2" aria-hidden="true"
                        ></i>Perfil del cuidador</btn></h5>
                </li> 
                <li class="list-group-item">
                    <btn class="btn boxed-btn-round-red" 
                        data-toggle="modal" data-target="#deleteReservation" onclick="createDeleteReservationModal('${reservation.startDate}', '${reservation.endDate}', '${reservation._id}')">
                        <i class="fa fa-times" aria-hidden="true"></i>
                    Cancelar
                        <a></a>
                    </btn>
                </li>
            </ul>
            `;
        };
    }
    reservationsSection.innerHTML = cards;   
};

// Función para crear las secciones de actividades de la reservación individual
async function createActivitiesSection(reservationData) {
    const allActivities = await getReservationActivities(reservationData._id);
    if (!allActivities) {
        console.error('No se pudo obtener la información de las actividades');
        return;
    }

    let activitiesSection = '';
    let activityNumber = 1;
    allActivities.forEach(activity => {
        // Mostrar las primeras 10 palabras de la descripcion y añadir puntos suspensivos
        const description = activity.description.split(' ').slice(0, 10).join(' ') + '...';
        activitiesSection += `
        <h5 class="list-group-item-activity">
            <b>${activityNumber}. ${activity.title}:<b>
            <h6>${description}</h6>
        </h5>
        `;
        activityNumber++;
    });

    return activitiesSection;
};

// Función para formatear fechas traidas de mongo
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(date).toLocaleDateString('es-ES', options);
};

// Función para crear el modal de perfil del cuidador
async function createCaretakerProfileModal(reservationID) {
    const caretakerData = await getCaretakerProfile(reservationID);
    if (!caretakerData) {
        console.error('No se pudo obtener la información del cuidador');
        return;
    }
    const modalContent = `
    <img class="caretaker-picture mb-2" src="${PROFILE_PHOTO_S3 + caretakerData.profilePicture}">
    <h5><b>Nombre:</b> ${caretakerData.username}</h5>
    <h5><b>Contacto:</b> ${caretakerData.email}</h5>
    <h6><i>${caretakerData.status}</i></h6>
    <br>
    <h5>Cuida a otra(s) ${caretakerData.assignedReservationsIDs.length} mascota(s)</h5>
    `;
    document.getElementById('caretaker-details-modal').innerHTML = modalContent;
};

// Función para crear el modal de eliminar reservación
async function createDeleteReservationModal(startDate, endDate, reservationID) {
    const modalContent = `
    <div class="row">
        <div class="col-md-12 text-center">
        <h5>Se eliminará esta reservación para los días:
        <br>
         <b>${formatDate(startDate)}</b> a <b>${formatDate(endDate)}</b> </h5>
        </div>
    </div>
    `;
    document.getElementById('delete-reservation-content').innerHTML = modalContent;
    
    const buttons = `
    <button type="button" class="btn boxed-btn-round-green" data-dismiss="modal">Cancelar</button>
    <button type="button" class="btn boxed-btn-round-cancel" onclick=deleteReservation('${reservationID}')>Eliminar</button>
    `;
    document.getElementById('delete-reservation-buttons').innerHTML = buttons;

};

// Función para crear el modal de crear reservación
async function createNewReservationModal() {
    const petsData = await getOwnerPets();
    if (!petsData) {
        console.error('No se pudo obtener la información de las mascotas');
        return;
    }
    let petOptions = '';
    // Sólo guardar los Pets cuya currentReservation sea null
    petsData.forEach(pet => {
        if (!pet.currentReservation) {
            petOptions += `<option value="${pet._id}">${pet.name}</option>`;
        }
    });

    const modalContent = `
    <div class="modal-body">
        <div class="row">
            <div class="col-md-12">
                <form>
                    <div class="form-group">
                        <h5 for="ownerPetOptions">Selecciona a tu mascota:</h5>
                        <select class="form-select" aria-label="petOptions" id="ownerPetOptions">
                            ${petOptions}
                        </select>
                    </div>
                    <div class="row">
                        <div class="col-md-6 form-group">
                            <h5 for="newReservationStartDate">Fecha de inicio:</h5>
                            <input type="date" class="form-control" id="newReservationStartDate" placeholder="Inicio">
                        </div>
                        <div class="col-md-6 form-group">
                            <h5 for="newReservationEndDate">Fecha de fin:</h5>
                            <input type="date" class="form-control" id="newReservationEndDate" placeholder="Fin">
                        </div>
                    </div>
                    <h5>Al continuar, crearás la reservación y procederás a añadir las actividades de tu mascota.</h5>
                </form>
            </div>
        </div>
    </div>
    <div class="modal-footer">
        <div id="noReservationAlert"></div>
        <button type="button" class="btn boxed-btn-round-cancel" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn boxed-btn-round-accept" onclick="checkReservationCreation()" 
        >Continuar</button>
    </div>
    `;
    document.getElementById('new-reservation-content').innerHTML = modalContent;
};

// Función para crear el modal de añadir actividades
async function createNewActivitiesModal(reservationID) {
    const modalContent = `
    <div class="modal-body">
        <form id="activitiesForm">
            <!-- Área dinámica para actividades -->
            <div id="activityList">
                <!-- Aquí se añadirán los campos de actividad dinámicamente -->
            </div>
            <button type="button" class="btn boxed-btn5" onclick="removeActivity()">Eliminar última</button>
            <button type="button" class="btn boxed-btn6" onclick="addActivity()">Agregar otra</button>
            <br><br>
            <h5>Si cancelas, tu reservación no se confirmará y tendrás que crear otra desde cero pues no se guardará ni se asignará un cuidador para tu mascota.</h5>
        </form>
    </div>
    <div class="modal-footer">
    <div id="noActivitiesAlert"></div>
        <button type="button" class="btn boxed-btn-round-cancel" data-dismiss="modal">Cancelar</button>
        <button type="button" class="btn boxed-btn-round-accept" onclick="submitActivities('${reservationID}')">Confirmar</button>
    </div>
    `;
    document.getElementById('news-activites-content').innerHTML = modalContent;
    // Agregar un campo de actividad por defecto
    addActivity();
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

    // Verificar si hay algo que actualizar o una foto para subir
    if (Object.keys(updateData).length > 0 || editedPicture) {
        // Actualizar datos si es necesario
        if (Object.keys(updateData).length > 0) {
            await editOwnerData(updateData);
        }
        // Actualizar foto de perfil si se seleccionó una nueva
        if (editedPicture) {
            await uploadProfilePicture(editedPicture);
        }
    } else {
        // Mostrar alerta si no hay nada que actualizar
        document.getElementById('noChangesAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            No hay datos por actualizar
        </div>
        `;
        // Quitar el mensaje de alerta después de un tiempo
        setTimeout(() => {
            document.getElementById('noChangesAlert').innerHTML = '';
        }, 2000);
    }
});

// Actualizar los datos del dueño en el DOM
function updateCardOwnerData(data) {
    // Actualiza los elementos del DOM (texto) con los nuevos datos
    document.getElementById('displayUsername').innerHTML = `<b>${data.username}</b>`; 
    document.getElementById('displayStatus').innerHTML = `<i>${data.status}</i>`; 
}

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

// Botón de añadir mascota
document.getElementById('createNewPetBtn').addEventListener('click', async function() {
    const newPetName = document.getElementById('petName').value;
    const newPetAge = document.getElementById('petAge').value;
    const newPetBreed = document.getElementById('petBreed').value;

    let updateData = {};
    if (newPetName.trim() !== '') updateData.name = newPetName;
    if (newPetAge.trim() !== '') updateData.age = newPetAge;
    if (newPetBreed.trim() !== '') updateData.breed = newPetBreed;

    if (Object.keys(updateData).length > 2) {
        await createPet(updateData);

    }
    else {
        document.getElementById('cantCreatePetAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            Completa todos los campos
        </div>
        `;
        setTimeout(() => {
            document.getElementById('cantCreatePetAlert').innerHTML = '';
        }, 2000);
    }
});

// EVENT DELEGATION: Mostrar el expediente de la mascota en la previsualización
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('record-modal-content');
    container.addEventListener('click', function (event) {
        if (event.target.id === 'updateRecordBtn' || event.target.closest('#updateRecordBtn')) {
            document.getElementById('newPdfInput').click();
            // Cambiarla en la vista previa
            document.getElementById('newPdfInput').addEventListener('change', function () {
                if (this.files && this.files[0]) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        document.getElementById('recordFrame').src = e.target.result;
                        if (document.getElementById('noRecordMessage')) {
                            document.getElementById('noRecordMessage').remove();
                        }
                    };
                    reader.readAsDataURL(this.files[0]); 
                }
            });
            
        }
    });
});

// Función que añade el máximo y mínimo de fechas seleccionables cuando se abre el modal createReservation
document.getElementById('addReservationBtn').addEventListener('click', async function() {
    // crear modal
    await createNewReservationModal();
    var today = new Date();
    var nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());

    var startDateInput = document.getElementById('newReservationStartDate');
    var endDateInput = document.getElementById('newReservationEndDate');

    startDateInput.min = today.toISOString().split('T')[0];
    startDateInput.max = nextYear.toISOString().split('T')[0];
    endDateInput.min = today.toISOString().split('T')[0];
    endDateInput.max = nextYear.toISOString().split('T')[0];
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

    if (Object.keys(updateData).length > 0 || editedPicture) {
        if (Object.keys(updateData).length > 0) {
            await editPetData(petID, updateData);
        }
        if(editedPicture) {
            await uploadPetPicture(petID, editedPicture);
        }
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


// Limpiar campos del modal de AÑADIR MASCOTA al presionar el botón de añadir
document.getElementById('addPetBtn').addEventListener('click', function() {
    document.getElementById('petName').value = '';
    document.getElementById('petAge').value = '';
    document.getElementById('petBreed').value = '';
});

// Guardar nuevo expediente
async function savePetRecord(petID) {
    const newRecord = document.getElementById('newPdfInput').files[0];
    if (newRecord) {
        await uploadPetRecord(petID, newRecord);
    } else {
        document.getElementById('noRecordAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            No se ha seleccionado un archivo
        </div>
        `;
        setTimeout(() => {
            document.getElementById('noRecordAlert').innerHTML = '';
        }, 2000);
    }
}

// Eliminar reservación al presionar el botón
async function deleteReservation(reservationID) {
    await cancelReservation(reservationID);
};

// Enviar los datos para ver si se puede crear una nueva reservación y abrir el modal de actividades
async function checkReservationCreation() {
    // Obtener datos de cada campo
    const petID = document.getElementById('ownerPetOptions').value;
    const startDate = document.getElementById('newReservationStartDate').value;
    const endDate = document.getElementById('newReservationEndDate').value;
    // Verificar que los campos no estén vacíos
    if (petID && startDate && endDate) {
        // Crear la reservación
        const newReservation = await createReservation({ petID, startDate, endDate });
        // Abrir el modal de actividades y ocultar el actual
        $('#createReservation').modal('hide');
        $('#addActivitiesModal').modal('show');
        // Cargar su contenido
        createNewActivitiesModal(newReservation._id);
    } else {
        document.getElementById('noReservationAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            Completa todos los campos
        </div>
        `;
        setTimeout(() => {
            document.getElementById('noReservationAlert').innerHTML = '';
        }, 2000);
    }

};


// ---------test
// Actividades test


function addActivity() {
    const activityList = document.getElementById('activityList');
    const activityDiv = document.createElement('div');
    activityDiv.className = "activity-entry"; 
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
            <select class="form-control" size="3">
                <option value="1 vez al día">1 vez al día</option>
                <option value="2 veces al día">2 veces al día</option>
                <option value="3 veces al día">3 veces al día</option>
                <option value="Alternando días">Alternando días</option>
                <option value="Cada semana">Cada semana</option>
                <option value="Cuando sea necesario">Cuando sea necesario</option>
                <option value="Revisar expediente">Revisar expediente</option>

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

async function submitActivities(reservationID) {
    // Recopila datos de todas las actividades creadas

    const activities = document.querySelectorAll('.activity-entry');
    const activitiesData = {};

    activities.forEach((activity, index) => {
        const title = activity.querySelector('input[placeholder="Título de la actividad"]').value;
        const description = activity.querySelector('input[placeholder="Describe brevemente la actividad"]').value;
        const frequency = activity.querySelector('select').value;
        
        activitiesData[index] = {
            title,
            description,
            frequency
        };
    });

    // Si hay una sola actividad y sus campos están vacíos, no se envía nada
    if (Object.keys(activitiesData).length === 1 && (activitiesData[0].title === '' || activitiesData[0].description === '' || activitiesData[0].frequency === '') ){
        // Mostrar noActivitiesAlert
        document.getElementById('noActivitiesAlert').innerHTML = `
        <div class="alert alert-secondary" role="alert">
            Agrega al menos una actividad válida
        </div>
        `;
        setTimeout(() => {
            document.getElementById('noActivitiesAlert').innerHTML = '';
        }, 2000);
    } else {
        console.log(activitiesData);
        try {
            await uploadActivities(reservationID, activitiesData);

        } catch (error) {
            console.error('Error during activity upload or reservation confirmation:', error);
        }
        try{
            await confirmReservation(reservationID);
        } catch (error){
            console.error("Error al confirmar: ", error);

        }
    }

}

