const { get } = require("http");

// Constantes
PROFILE_PHOTO_S3 = "https://vk-profile-photos.s3.amazonaws.com/";


// --- Funciones de token ---
window.addEventListener('load', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('GoogleAccount', true);
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

// --- Funciones de inicialización ---
function initApp() {
    if (localStorage.getItem('token')) {
        createNotificationCard();
    } else {
        console.error('No hay token de autenticación');
        window.location.href = 'login.html';
    }

};

//Funciones de Api

async function getOwnerNotifications() {

    const token = localStorage.getItem('token');

    try {
        const response = await fetch(`/notification/notification`, {  // Utiliza la ruta correcta
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

async function createNotificationCard(){

    const notifications = await getOwnerNotifications();
    console.log(notifications);
    if(!notifications){
        console.error('No se pudieron obtener las notificaciones');
        return;
    }
    const notificationSection= document.getElementById('notification-list');
    let notificationcards = '';
    if(notifications.length === 0){
        notificationcards = `
        <div class="notification-card">
            <h3>No tienes notificaciones</h3>
        </div>
        `;
    }
    else{
        notifications.forEach(notification => {
            notificationcards += `
            <li>
                <span class="notification-icon">
                    <span class="notification-text">
                        ${notification.activity}
                    </span>
                    <span class="notification-date">
                        ${notification.timestamp}
                    </span>
                </span>
            </li>
            `;
    });

    }
    notificationSection.innerHTML = notificationcards;

}
function toggleNotifications() {
    const menu = document.getElementById('notificationMenu');
    if (menu.style.display === 'none') {
        menu.style.display = 'block'; // Mostrar el menú de notificaciones
        createNotificationCard(); // Cargar y mostrar las notificaciones
    } else {
        menu.style.display = 'none'; // Ocultar el menú de notificaciones
    }
}





