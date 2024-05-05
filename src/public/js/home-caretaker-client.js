const PROFILE_PHOTO_S3 = "https://vk-profile-photos.s3.amazonaws.com/";

window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    //console.log('Token from URL:', token)
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
    } catch (error) {
        console.error('ERROR:', error);
    }
}


async function getCaretakerPets() {
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);
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
        console.log('Pets data:', petsData);
        return petsData;
    } catch (error) {
        console.error('ERROR:', error);
    }

}

// Editar datos del dueño
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
        updateCardOwnerData(data);
    }).catch(error => {
        console.error('Error:', error);
    });
}
// Cargar nueva foto de perfil del dueño
async function uploadProfilePicture(file) {
    const token = localStorage.getItem('token');
    // Obtener el id del usuario
    const caretakerData = await getCaretakerData();
    if (!caretakerData) {
        console.error('No se pudo obtener la información del dueño');
        return;
    }
    const ownerID = caretakerData._id;
    const formData = new FormData();
    formData.append('ownerID', ownerID);
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
        document.getElementById('displayPicture').src = isItGoogleAccount(data);
    }).catch(error => {
        console.error('Error:', error);
    });
};

// Función que recupera las mascotas del dueño
async function getCaretakerPets() {
    const token = localStorage.getItem('token');

    try {
        const response = await fetch('/caretaker/get-caretaker-pets', {
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
async function getPetData(petId) {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No hay token de autenticación');
        return;
    }
    try {
        const response = await fetch(`/caretaker/get-caretaker-pets/${petId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const petData = await response.json();
        console.log('Pet data:', petData);
        return petData;
    } catch (error) {
        console.error('ERROR:', error);
    }
}
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
} async function getActivities() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/caretaker/get-assigned-activities', {
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

// Fabricar el contenido del MODAL DE EDITAR PERFIL ---
async function createEditProfileModal() {
    const ownerData = await getCaretakerData();
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
    const petsData = await getCaretakerPets();
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
                            <btn class="btn boxed-btn6" data-toggle="modal" data-target="#petInfoModal">
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
    const petData = await getPetData(petID);
    if (!petData) {
        console.error('[Editar mascota] No se pudo obtener la información de la mascota: ', petID);
        return;
    }
    const modalContent = `
        <div class="modal" id="petInfoModal" tabindex="-1" role="dialog" aria-labelledby="petInfoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title" id="petInfoModalLabel">Detalles de la mascota</h3>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <!-- Left section for PDF viewer -->
                        <div class="col-md-5 text-center vertical-center">
                            <img class="caretaker-picture mb-2" src="../img/pug.png">
                            <h5><b>Nombre: </b>${pet.name}/h5>
                            <h5><b>Raza: </b>${pet.breed}</h5>
                            <h5><b>Edad: </b>${pet.age}</h5>
                        </div>
                        <!-- Right section for upload new PDF -->
                        <div class="col-md-7 text-center">
                            <h4>Previsualización de expediente</h4>
                            <div class="col-md-12">
                                <iframe src="../test-file/test-record.pdf" style="width: 100%; height: 450px;" frameborder="0"></iframe>
                            </div>
                        </div>
                        
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn boxed-btn-round-cancel" data-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
    `;
    document.getElementById('edit-pet-body-modal').innerHTML = modalContent;
    const saveBtn = `<button type="button" class="btn boxed-btn-round-accept" onclick="savePet('${petData._id}')">Guardar cambios</button>`;
    document.getElementById('saveModifiedPetBtn').innerHTML = saveBtn;
}


//Funcion para crear los divs de las reservaciones
async function createReservationsCards() {
    const reservations = await getReservations();
    const activities = await getActivities();
    if (!reservations) {
        console.error('No se pudo obtener la información de las reservaciones');
        return;
    }
    const reservationsSection = document.getElementById('reservations-section');
    let cards = '';
    if (reservations.length === 0) {
        cards = `
        <div class="col-md-12">
            <div class="card-reservation">
                <div class="card-body">
                    <h4 class="card-title
                    "><b>No tienes reservaciones asignadas</b></h4> 
                    <ul class="list-group
                    list-group-flush">
                    </ul>
                </div>
            </div>
        </div>
        `;
    } else {
        reservations.forEach(reservation => {
            cards += `
            <div class="col-md-12">
                <div class="card-reservation">
                    <div class="card-body">
                        <h3 class="card-title ml-2"><b>${reservation.reservationName}</b></h3>
                        <ul class="list-group list-group-flush">
                            <li class="list-group-item"><h5>${reservation.startDate} - ${reservation.endDate}</h5></li>
                            <li class="list-group-item">
                                <btn class="btn boxed-btn5" id="ownerProfileBtn" data-toggle="modal" data-target="#ownerProfilePreview">
                                    <i class="fa fa-address-card mr-2"  aria-hidden="true"></i>
                                    Perfil del dueño
                                </btn>
                            </li>
                            <li class="list-group-item">
                                <h4><b>Actividades a completar:</b></h4>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            `;

            // Ciclo para mostrar las actividades de cada reserva
            activities.forEach(activity => {

                cards += `
                    <div class="col-md-12">
                        <div class="card-reservation">
                            <div class="card-body">
                                <div class="list-group-item-activity" id="individualActivity">
                                    <div class="row accomplishable col-12">
                                        <div class="col-md-10">
                                            <h5><b>${activity.title}</b> <i>${activity.frequency}</i></h5>
                                            <p>${activity.description}</p>
                                            <p style="font-size: small;">Ya se ha completado ${activity.count} veces</p>
                                        </div>
                                        <div class="col-md-2 accomplish-section">
                                            <btn class="btn boxed-btn-round-green accomplish-btn" >
                                                <i class="fa fa-check mr-1" aria-hidden="true"></i>
                                                Completar 
                                            </btn>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;

            });
        });
    }
    if (document.getElementById('card-reservation')) {
        document.getElementById('card-reservation').innerHTML = cards;
    }
}

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
    if (Object.keys(updateData).length > 0) {
        await editCaretakerData(updateData);
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