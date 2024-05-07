const PROFILE_PHOTO_S3 = "https://vk-profile-photos.s3.amazonaws.com/";
const socket = io();


window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        localStorage.setItem('token', token);
        removeTokenFromUrl();
    } else {
        initApp();
    }
});

function removeTokenFromUrl() {
    const url = new URL(window.location);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.pathname + url.search);
    initApp();
}
function initApp() {
    if (localStorage.getItem('token')) {
        // Cargar datos del cuidador
        createCaretakerCardBody();
        createPetsCards();
        createReservationsCards();

    } else {
        console.error('No hay token de autenticación');
        window.location.href = 'login.html';
    }

};
// --- Obtener la foto de perfil correcta de acuerdo al tipo de cuenta ---
function isItGoogleAccount(obj) {
    return localStorage.getItem('GoogleAccount') ? obj.profilePicture : PROFILE_PHOTO_S3 + obj.profilePicture;
};

// --- Funciones de API ---
async function getCaretakerData() {
    const token = localStorage.getItem('token');

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
        return caretakerData;
    } catch (error) {
        console.error('ERROR:', error);
    }
}

async function accomplishActivity(activityId) {
    const token = localStorage.getItem('token');
    console.log('Activity ID:', activityId);
    fetch('/caretaker/accomplish-activity', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ activityId })
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        const data = response.json();
        console.log('Data:', data);
        
        socket.emit('RecieveAcomplished', activityId);
        //return data;
    }).then(() => {
        // TODO: evitar recargar página, quitar cuando los sockets funcionen
        //location.reload();
        createReservationsCards();
    }).catch(error => {
        console.error('Error:', error);
    });
}

async function getCaretakerPets() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No hay token de autenticación');
        return;
    }
    try {
        const response = await fetch('/caretaker/get-caretaker-pets', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const petsData = await response.json();
        return petsData;
    } catch (error) {
        console.error('ERROR:', error);
    }

}

// Editar datos del cuidador
async function editCaretakerData(data) {
    const token = localStorage.getItem('token');
    fetch('/caretaker/update-caretaker', {
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
        createCaretakerCardBody();
    }).catch(error => {
        console.error('Error:', error);
    });
}
// Cargar nueva foto de perfil del cuidador
async function uploadProfilePicture(file) {
    const token = localStorage.getItem('token');
    // Obtener el id del usuario
    const caretakerData = await getCaretakerData();
    if (!caretakerData) {
        console.error('No se pudo obtener la información del dueño');
        return;
    }
    const caretakerID = caretakerData._id;
    const formData = new FormData();
    formData.append('caretakerID', caretakerID);
    formData.append('photo', file);

    fetch('/caretaker/upload-photo', {
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
        document.getElementById('caretakerDisplayPicture').src = isItGoogleAccount(data);
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Función que recupera las mascotas del dueño
async function getCaretakerPets() {
    const token = localStorage.getItem('token');

    const caretakerData = await getCaretakerData();
    const caretakerId = caretakerData._id;

    try {
        const response = await fetch(`/caretaker/get-caretaker-pets/${caretakerId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const petData = await response.json();
        return petData;
    }
    catch (error) {
        console.error('Error:', error);
        return null;
    }
};
async function getPetData(petId) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No hay token de autenticación');
        return;
    }
    try {
        const response = await fetch(`/caretaker/get-caretaker-pets-by-id/${petId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const petData = await response.json();
        return petData;
    } catch (error) {
        console.error('ERROR:', error);
    }
}

async function getOwnerData(ownerID) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/caretaker/get-owner-by-id/${ownerID}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            },
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

// Obtener el expediente de una mascota
async function getPetRecord(petID) {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/caretaker/get-record/${petID}`, {
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
async function getReservations() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/caretaker/get-assigned-reservations', {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

async function getActivities(reservationID) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/caretaker/get-assigned-activities/${reservationID}`, {
            method: 'GET',
            headers: {
                'content-type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
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

// --- Funciones de DOM ---
// Función para crear el cuerpo de la tarjeta del Caretaker ---
async function createCaretakerCardBody() {
    const caretakerData = await getCaretakerData(); // Asegúrate de que esta función devuelva los datos o maneje correctamente la obtención de datos.
    if (!caretakerData) {
        console.error('No se pudo obtener la información del cuidador');
        return;
    }

    const cardBody = `
    <div class="card-caretaker">
        <img class="card-img-top" src="${isItGoogleAccount(caretakerData)}" alt="Profile picture" id="caretakerDisplayPicture">
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

// Fabricar el contenido del MODAL DE EDITAR PERFIL ---
async function createEditProfileModal() {
    const caretakerData = await getCaretakerData();
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
                        <input type="text" class="form-control" id="editedUsername" placeholder="${caretakerData.username}">
                    </div>
                    <div class="form-group">
                        <h5 for="user-status">Estado</h5>
                        <textarea class="form-control" id="editedStatus" rows="2" maxlength="250" placeholder="${caretakerData.status}" style="resize: none;"></textarea>
                    </div>
                    <div class="form-group">
                        <h5 for="user-status">E-mail</h5>
                        <input type="text" class="form-control" id="editedEmail" placeholder="${caretakerData.email}" ${inputDisabled}>
                    </div>
                </form>
            </div>
            <!-- Right section for profile picture -->
            <div class="col-md-4 text-center">
                <img src="${isItGoogleAccount(caretakerData)}" alt="Profile Picture" class="img-fluid change-picture" id="profilePictureOwner">
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
    const petsData = await getCaretakerPets();
    //console.log('Pets data in createpetscard:', petsData);
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

                            <btn class="btn boxed-btn6" data-toggle="modal" data-target="#petInfoModal" onclick="createInfoPetModal('${pet._id}')">
                                <i class="fa fa-plus mr-1" aria-hidden="true"></i>
                                <a>Info</a></btn>
                                
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
async function createInfoPetModal(petID) {
    const pet2 = await getPetData(petID);
    const record = await getPetRecord(petID);

    const modalContent = `
    <div class="modal-body">
    <div class="row">
        <!-- Left section for PDF viewer -->
        <div class="col-md-5 text-center vertical-center">
            <img class="caretaker-picture mb-2" src="${PROFILE_PHOTO_S3 + pet2.profilePicture}">
            <h5><b>Nombre: </b>${pet2.name}</h5>
            <h5><b>Raza: </b>${pet2.breed}</h5>
            <h5><b>Edad: </b>${pet2.age}</h5>
        </div>
        <!-- Right section for upload new PDF -->
        <div class="col-md-7 text-center">
            <h4>Previsualización de expediente</h4>
            <div class="col-md-12">
                <iframe src="${record.url}" style="width: 100%; height: 450px;" frameborder="0"></iframe>
            </div>
        </div>
        
    </div>
</div>
    `;
    document.getElementById('petInfoModalContent').innerHTML = modalContent;
}


// Function to format the date in a shorter format
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

async function createReservationsCards() {
    const reservations = await getReservations();

    if (!reservations) {
        console.error('No se pudo obtener la información de las reservaciones');
        return;
    }
    const reservationsSection = document.getElementById('card-reservation-section');
    let cards = '';
    if (reservations.length === 0) {
        cards = `
        <div class="col-md-12">
            <div class="card-reservation">
                <div class="card-body">
                    <h4 class="card-title"><b>No tienes reservaciones asignadas</b></h4> 
                    <ul class="list-group list-group-flush">
                    </ul>
                </div>
            </div>
        </div>
        `;
    } else {
        for (const reservation of reservations) {
            const petData = await getPetData(reservation.petID);
            const activitiesCards = await createActivitiesCards(reservation._id);
            const ownerData = await getOwnerData(reservation.ownerID);

            // Create reservation card
            let reservationCard = `
            <div class="col-md-12">
                <div class="card-reservation m-3">
                    <div class="card-body">
                        <h3 class="card-title ml-2"><b>Reservación de: ${petData.name}</b></h3>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5>${formatDate(reservation.startDate)} - ${formatDate(reservation.endDate)}</h5></li>
                            <li class="list-group-item">
                                <button class="btn boxed-btn5 owner-profile-btn" data-toggle="modal" data-target="#ownerProfilePreview" data-owner-id="${reservation.ownerID}">
                                    <i class="fa fa-address-card mr-2" aria-hidden="true"></i>
                                    Perfil del dueño
                                </button>
                            </li>
                            <li class="list-group-item">
                                <h4><b>Actividades a completar:</b></h4>
                                
                                    ${activitiesCards}
                                
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            `;
            cards += reservationCard;
        }
    }
    reservationsSection.innerHTML = cards;

        // Attach click event listener to "Completar" buttons
        document.querySelectorAll('.accomplish-btn').forEach(button => {
            button.addEventListener('click', function (event) {
                const activityId = event.target.getAttribute('data-activity-id');
    
    
                accomplishActivity(activityId);
            });
        });
        

    // Attach click event listener to "Perfil del dueño" buttons
    document.querySelectorAll('.owner-profile-btn').forEach(button => {
        button.addEventListener('click', async function (event) {
            const ownerId = event.target.getAttribute('data-owner-id');
            const ownerData = await getOwnerData(ownerId);

            // Populate modal with ownerData
            const modalTitle = document.querySelector('#ownerProfilePreviewLabel');
            modalTitle.textContent = `Detalles del dueño`;

            const profilePicture = ownerData.email.endsWith('@gmail.com') ? ownerData.profilePicture : PROFILE_PHOTO_S3 + ownerData.profilePicture;

            const modalBody = document.querySelector('.modal-body-owner');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-12 text-center vertical-center">
                        <img class="caretaker-picture mb-2" src="${profilePicture}">
                        <h5><b>Nombre:</b> ${ownerData.username}</h5>
                        <h5><b>Contacto:</b> ${ownerData.email}</h5>
                        <h5>${ownerData.status}</h5>
                        <br>
                        <h5>Tiene otras ${ownerData.petsIDs.length} mascotas</h5>
                    </div>
                </div>
            `;
        });
    });
}

// Actividades
async function createActivitiesCards(reservationID) {
    const allActivities = await getActivities(reservationID);
    if (!allActivities) {
        console.error('No se pudo obtener la información de las actividades');
        return;
    }
    let activitiesCards = '';
    let activityNumber = 1;
    allActivities.forEach(activity => {
        activitiesCards += `
        <div class="col-md-12">
            <div class="card-reservation">
                <div class="card-body">
                    <div class="list-group-item-activity">
                        <div class="row accomplishable col-12">
                            <div class="col-md-10">
                                <h5><b>${activityNumber}. ${activity.title}</b> <i>${activity.frequency}</i></i></h5>
                                <p>${activity.description}</p>
                                <p style="font-size: small;">Ya se ha completado ${activity.timesCompleted} veces</p>
                            </div>
                            <div class="col-md-2 accomplish-section">
                                <button class="btn boxed-btn-round-green accomplish-btn" data-activity-id="${activity._id}">
                                    <i class="fa fa-check mr-1" aria-hidden="true"></i>
                                    Completar 
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `;
        activityNumber++;
    });

    return activitiesCards;

};

// --- Eventos DOM ---
// TEMPORAL: Cerrar sesión (no-google)
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', function () {
        localStorage.removeItem('token');
        localStorage.removeItem('GoogleAccount');
        window.location.href = '../index.html';
    });
}

// Abrir modal de editar perfil
document.addEventListener('DOMContentLoaded', function () {
    //El event listener esta escuchando a lo que pasa con el tag #editProfileModal
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
document.getElementById('saveChangesProfileBtn').addEventListener('click', async function (event) {
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
    if (Object.keys(updateData).length > 0 || editedPicture) {
        if(Object.keys(updateData).length > 0) {
            await editCaretakerData(updateData);
        }
        if(editedPicture) {
            await uploadProfilePicture(editedPicture);
        }
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