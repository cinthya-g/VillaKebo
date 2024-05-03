
// --- LOG IN FORM ---
document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const userType = formData.get('userType');  // Guardamos userType para usar después en la redirección
    const data = {
        email: formData.get('email'),
        password: formData.get('password')
    };
    console.log(data);
    fetch(`/auth/${userType}-login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            if(response.status === 401) {
                response.json().then(data => {
                    const errorMessageDiv = document.getElementById('errorMessage');
                    errorMessageDiv.textContent = 'Alguno de los datos proporcionados son incorrectos'; 
                    errorMessageDiv.style.display = 'block'; 
                });  // Se reemplaza el errorMessage
            }
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
});

// --- GOOGLE LOG IN ---
document.getElementById('googleLogin').addEventListener('click', function(event) {
    event.preventDefault();
    // Redirige al usuario directamente a la ruta de autenticación de Google en tu servidor
    window.location.href = '/google-passport/google-auth';
});

/*
document.getElementById('nousedf').addEventListener('click', function(event) {
    event.preventDefault();
    fetch(`/google-passport/google-auth`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }
        return response.json();
    }).then(data => {
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        window.location.href = '/home-owner.html';

    }).catch(error => {
        console.error('GOOGLE LOGIN - Error:', error);
        //alert('Hubo un problema con tu solicitud de inicio de sesión: ' + error.message);
    });
});
*/