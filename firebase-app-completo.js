// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDdTlhwvEzHTnRqGmLhUARucCgw7K76XJE",
    authDomain: "lista-de-espera-palace.firebaseapp.com",
    databaseURL: "https://lista-de-espera-palace-default-rtdb.firebaseio.com",
    projectId: "lista-de-espera-palace",
    storageBucket: "lista-de-espera-palace.appspot.com",
    messagingSenderId: "1001196881051",
    appId: "1:1001196881051:web:9af1c75de15c15b41fc0e0"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Referencia a la base de datos
const db = firebase.database();

// Obtener ubicación (CDMX, Cancún, etc.) - por defecto CDMX
// Extraer ubicación de la ruta URL como /lista-de-espera-UBICACION
let currentLocation = 'cdmx'; // Valor por defecto
const path = window.location.pathname.toLowerCase();

// Extraer ubicación de la ruta URL
if (path.includes('lista-de-espera-cdmx')) {
    currentLocation = 'cdmx';
} else if (path.includes('lista-de-espera-cancun')) {
    currentLocation = 'cancun';
} else if (path.includes('lista-de-espera-puebla')) {
    currentLocation = 'puebla';
} else if (path.includes('lista-de-espera-monterrey')) {
    currentLocation = 'monterrey';
}

// También verificar si hay un parámetro de URL para retrocompatibilidad
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('location')) {
    currentLocation = urlParams.get('location');
}

console.log(`Ubicación actual: ${currentLocation}`);

// Referencia a la ubicación actual
const locationRef = db.ref(`locations/${currentLocation}`);
const tablesRef = locationRef.child('tables');
const playersRef = locationRef.child('players');

// Variables para almacenar datos en memoria
let tables = [];
let players = [];
let filteredPlayers = [];

// DOM Elements
const adminButton = document.getElementById('admin-button');
const loginModal = document.getElementById('login-modal');
const adminDashboard = document.getElementById('admin-dashboard');
const closeLoginModal = document.querySelector('#login-modal .close');
const closeAdminModal = document.querySelector('#admin-dashboard .close');
const loginForm = document.getElementById('login-form');
const tableForm = document.getElementById('table-form');
const playerForm = document.getElementById('player-form');
const adminTablesTab = document.getElementById('tables-tab');
const adminPlayersTab = document.getElementById('players-tab');
const tabButtons = document.querySelectorAll('.tab-button');
const adminTablesList = document.getElementById('admin-tables-list');
const adminWaitingLists = document.getElementById('admin-waiting-lists');
const adminListFilter = document.getElementById('admin-list-filter');
const activeTablesContainer = document.getElementById('active-tables-container');
const waitingListsContainer = document.getElementById('waiting-lists-container');
const currentDateTimeElement = document.getElementById('current-date-time');
const currentYearElement = document.getElementById('current-year');

// Función para generar IDs únicos
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    setInterval(updateDateTime, 60000); // Update time every minute
    
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
    
    setupEventListeners();
    setupRealtimeListeners();
    
    // Check for demo data after a moment to ensure Firebase is ready
    setTimeout(() => {
        checkAndAddDemoData();
    }, 2000);
});

// Función para configurar escuchas en tiempo real con Firebase
function setupRealtimeListeners() {
    tablesRef.on('value', (snapshot) => {
        tables = [];
        snapshot.forEach((childSnapshot) => {
            const table = childSnapshot.val();
            tables.push(table);
        });
        tables.sort((a, b) => {
            // Primero por número de mesa
            return parseInt(a.number) - parseInt(b.number);
        });
        renderActiveTables();
        renderAdminTablesList();
    });
    
    playersRef.on('value', (snapshot) => {
        players = [];
        snapshot.forEach((childSnapshot) => {
            const player = childSnapshot.val();
            players.push(player);
        });
        players.sort((a, b) => {
            // Primero por timestamp (más antiguos primero)
            return new Date(a.timestamp) - new Date(b.timestamp);
        });
        renderWaitingLists();
        renderAdminWaitingLists();
    });
}

// Comprobar si hay datos y añadir datos de demostración si es necesario
function checkAndAddDemoData() {
    tablesRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No hay mesas, añadiendo datos de demo");
            addDemoTablesData();
        }
    });
    
    playersRef.once('value').then((snapshot) => {
        if (!snapshot.exists()) {
            console.log("No hay jugadores, añadiendo datos de demo");
            addDemoPlayersData();
        }
    });
}

// Función para guardar datos en Firebase
function saveData() {
    // Ya no es necesario guardar datos localmente con localStorage
    // Los datos se guardan automáticamente en Firebase cuando se añaden/modifican
    console.log("Datos guardados en Firebase");
}

// Modificación de las funciones de manipulación de datos
function addTable(tableData) {
    // Asegúrate de que tiene un ID único
    tableData.id = tableData.id || generateId();
    
    // Añadir timestamp si no tiene
    if (!tableData.timestamp) {
        tableData.timestamp = new Date().toISOString();
    }
    
    // Añadir la mesa a Firebase
    tablesRef.child(tableData.id).set(tableData)
        .then(() => {
            showToast('Éxito', `Mesa ${tableData.number} añadida`, 'success');
        })
        .catch(error => {
            console.error("Error añadiendo mesa:", error);
            showToast('Error', `No se pudo añadir la mesa: ${error.message}`, 'error');
        });
}

function updateTable(tableId, tableData) {
    tablesRef.child(tableId).update(tableData)
        .then(() => {
            showToast('Éxito', `Mesa ${tableData.number || ''} actualizada`, 'success');
        })
        .catch(error => {
            console.error("Error actualizando mesa:", error);
            showToast('Error', `No se pudo actualizar la mesa: ${error.message}`, 'error');
        });
}

function deleteTable(tableId) {
    tablesRef.child(tableId).remove()
        .then(() => {
            showToast('Éxito', 'Mesa eliminada', 'success');
        })
        .catch(error => {
            console.error("Error eliminando mesa:", error);
            showToast('Error', `No se pudo eliminar la mesa: ${error.message}`, 'error');
        });
}

function addPlayer(playerData) {
    // Asegúrate de que tiene un ID único
    playerData.id = playerData.id || generateId();
    
    // Añadir el jugador a Firebase
    playersRef.child(playerData.id).set(playerData)
        .then(() => {
            showToast('Éxito', `Jugador ${playerData.name} añadido`, 'success');
            
            // Eliminar la marca de nuevo después de 5 minutos
            if (playerData.isNew) {
                setTimeout(() => {
                    playersRef.child(playerData.id).update({ isNew: false });
                }, 300000); // 5 minutos
            }
        })
        .catch(error => {
            console.error("Error añadiendo jugador:", error);
            showToast('Error', `No se pudo añadir el jugador: ${error.message}`, 'error');
        });
}

function updatePlayer(playerId, playerData) {
    playersRef.child(playerId).update(playerData)
        .then(() => {
            showToast('Éxito', `Jugador ${playerData.name || ''} actualizado`, 'success');
        })
        .catch(error => {
            console.error("Error actualizando jugador:", error);
            showToast('Error', `No se pudo actualizar el jugador: ${error.message}`, 'error');
        });
}

function deletePlayer(playerId) {
    playersRef.child(playerId).remove()
        .then(() => {
            showToast('Éxito', 'Jugador eliminado', 'success');
        })
        .catch(error => {
            console.error("Error eliminando jugador:", error);
            showToast('Error', `No se pudo eliminar el jugador: ${error.message}`, 'error');
        });
}

// Funciones específicas para la manipulación de elementos de la UI
function toggleTable(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (table) {
        table.active = !table.active;
        updateTable(tableId, { active: table.active });
        renderActiveTables();
        renderAdminTablesList();
    }
}

function editTable(tableId) {
    const table = tables.find(t => t.id === tableId);
    if (table) {
        document.getElementById('table-number').value = table.number;
        document.getElementById('game-type').value = table.gameType;
        document.getElementById('stake').value = table.stake;
        document.getElementById('buyinMin').value = table.buyinMin;
        document.getElementById('buyinMax').value = table.buyinMax;
        document.getElementById('availableSeats').value = table.availableSeats;
        document.getElementById('tableStatus').value = table.status;
        document.getElementById('callTime').value = table.callTime;
        
        // Cambia el botón del formulario a "Actualizar" y añade el ID de la mesa
        const submitButton = tableForm.querySelector('button[type="submit"]');
        submitButton.textContent = 'Actualizar Mesa';
        submitButton.dataset.edit = 'true';
        submitButton.dataset.tableId = tableId;
    }
}
