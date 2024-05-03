// Ejemplo de función para cargar los datos del caretaker y actualizar el HTML
function loadCaretakerData(caretakerId) {
    fetch(`/api/caretaker/${caretakerId}`)
    .then(response => response.json())
    .then(data => {
        const caretakerCard = document.getElementById('card-caretaker-section');

        caretakerCard.innerHTML = `
            <div class="card-caretaker">
                <img class="card-img-top" src="${data.profilePictureUrl}" alt="Profile picture">
                <div class="card-body">
                    <h4 class="card-title"><b>${data.username}</b></h4>
                    <h5 class="card-text-status"><i>${data.status}</i></h5>
                    <br>
                    <div class="card-body-bottom">
                        <btn class="btn boxed-btn5" id="editProfileBtn" data-toggle="modal" data-target="#editProfileModal">
                            <i class="fa fa-pencil-alt" aria-hidden="true"></i>
                            <a>Editar perfil</a></btn>
                        <br>
                    </div>
                </div>
            </div>`;
    })
    .catch(error => console.error('Error fetching caretaker data:', error));
}
function updateCaretaker(caretakerId, updatedData) {
    fetch(`/update-caretaker`, {
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
