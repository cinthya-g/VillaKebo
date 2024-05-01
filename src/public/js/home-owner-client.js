
// Evento de prueba para cambiar imagen y probar previsualización
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

