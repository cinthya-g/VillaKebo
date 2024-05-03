// --- SIGN UP FORM ---
document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const userType = formData.get('userType');  // Guardamos userType para usar después en la redirección
    const data = {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        isOwner: userType === 'owner'
};
console.log(data);
fetch('/auth/register', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            if(response.status === 400) {
                response.json().then(data => {
                    const errorMessageDiv = document.getElementById('emailMessage');
                    errorMessageDiv.textContent = 'Ese correo ya está en uso'; // Actualiza el texto del mensaje
                    errorMessageDiv.style.display = 'block'; // Hace visible el div
                });  // Se reemplaza el emailMessage
            }
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        console.log(data);
        // Llamar a los endpoints de login y redirigir a la página de home dependiendo del tipo de usuario
        fetch(`/auth/${userType}-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: formData.get('email'),
                password: formData.get('password')
            })
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        }).then(data => {
            // Guardar el token en localStorage
            localStorage.setItem('token', data.token);
            
            if (userType === 'owner') {
                window.location.href = '/home-owner.html';
            } else {
                window.location.href = '/home-caretaker.html';
            }
        }).catch(error => {
            console.error('LOGIN - Error:', error);
            //alert('Hubo un problema con tu solicitud de inicio de sesión: ' + error.message);
        });

    }).catch(error => {
        console.error('SIGNUP - Error:', error);
        //alert('Hubo un problema con tu solicitud de registro: ' + error.message);
    });
});