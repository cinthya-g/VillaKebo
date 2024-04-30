
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
