    // Add event listeners to buttons
    document.querySelectorAll('.toggle-table').forEach(button => {
        button.addEventListener('click', () => {
            const tableId = button.dataset.id;
            toggleTable(tableId);
        });
    });
    
    document.querySelectorAll('.edit-table').forEach(button => {
        button.addEventListener('click', () => {
            const tableId = button.dataset.id;
            editTable(tableId);
        });
    });
    
    document.querySelectorAll('.delete-table').forEach(button => {
        button.addEventListener('click', () => {
            const tableId = button.dataset.id;
            const confirmation = confirm("¿Estás seguro de que quieres eliminar esta mesa?");
            if (confirmation) {
                deleteTable(tableId);
            }
        });
    });
}

// Función auxiliar para crear un grupo de jugadores
function createPlayerGroup(groupName, groupPlayers) {
    const waitingListElement = document.createElement('div');
    waitingListElement.className = 'waiting-list fade-in';
    
    const listHeader = document.createElement('h3');
    listHeader.className = 'list-header';
    listHeader.textContent = groupName;
    waitingListElement.appendChild(listHeader);
    
    // Agrupar jugadores por status
    const presentPlayers = groupPlayers.filter(player => player.status === 'Presente');
    const absentPlayers = groupPlayers.filter(player => player.status === 'Ausente');
    
    // Sort by timestamp (oldest first)
    presentPlayers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    absentPlayers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Crear lista para jugadores presentes
    if (presentPlayers.length > 0) {
        const presentHeader = document.createElement('h4');
        presentHeader.className = 'status-header present';
        presentHeader.textContent = 'Presentes';
        waitingListElement.appendChild(presentHeader);
        
        const presentList = document.createElement('ul');
        presentList.className = 'players-list';
        
        presentPlayers.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.className = 'player-item status-present';
            if (player.isNew) {
                playerItem.classList.add('new-player');
            }
            
            const waitTime = formatDate(player.timestamp);
            
            playerItem.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-wait-time">${waitTime}</span>
            `;
            
            presentList.appendChild(playerItem);
        });
        
        waitingListElement.appendChild(presentList);
    }
    
    // Crear lista para jugadores ausentes
    if (absentPlayers.length > 0) {
        const absentHeader = document.createElement('h4');
        absentHeader.className = 'status-header absent';
        absentHeader.textContent = 'Ausentes';
        waitingListElement.appendChild(absentHeader);
        
        const absentList = document.createElement('ul');
        absentList.className = 'players-list';
        
        absentPlayers.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.className = 'player-item status-absent';
            
            const waitTime = formatDate(player.timestamp);
            
            playerItem.innerHTML = `
                <span class="player-name">${player.name}</span>
                <span class="player-wait-time">${waitTime}</span>
            `;
            
            absentList.appendChild(playerItem);
        });
        
        waitingListElement.appendChild(absentList);
    }
    
    return waitingListElement;
}

// Función auxiliar para añadir event listeners a botones de jugadores
function addPlayerEventListeners() {
    document.querySelectorAll('.edit-player').forEach(button => {
        button.addEventListener('click', () => {
            const playerId = button.dataset.id;
            editPlayer(playerId);
        });
    });
    
    document.querySelectorAll('.delete-player').forEach(button => {
        button.addEventListener('click', () => {
            const playerId = button.dataset.id;
            const confirmation = confirm("¿Estás seguro de que quieres eliminar este jugador?");
            if (confirmation) {
                deletePlayer(playerId);
            }
        });
    });
}

// Function to update date and time
function updateDateTime() {
    if (currentDateTimeElement) {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        // Primera letra en mayúscula
        let formattedDate = now.toLocaleDateString('es-MX', options);
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
        
        currentDateTimeElement.textContent = formattedDate;
    }
}

// Toast Notification System
function showToast(title, message, type = 'info') {
    // Create toast container if it doesn't exist
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    // Create new toast
    const toast = document.createElement('div');
    toast.className = `toast toast-${type} fade-in`;
    
    // Icon based on type
    let icon = '';
    switch (type) {
        case 'success':
            icon = '<i class="fas fa-check-circle"></i>';
            break;
        case 'error':
            icon = '<i class="fas fa-exclamation-circle"></i>';
            break;
        case 'warning':
            icon = '<i class="fas fa-exclamation-triangle"></i>';
            break;
        default:
            icon = '<i class="fas fa-info-circle"></i>';
    }
    
    toast.innerHTML = `
        <div class="toast-header">
            ${icon}
            <strong>${title}</strong>
            <button class="toast-close">&times;</button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;
    
    // Add to container
    toastContainer.appendChild(toast);
    
    // Add close button functionality
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.classList.add('fade-out');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 5000);
}

// Utility function to group arrays
function groupBy(array, keyGetter) {
    const map = new Map();
    array.forEach((item) => {
        const key = keyGetter(item);
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            collection.push(item);
        }
    });
    return Object.fromEntries(map);
}

// Utility function to format dates
function formatDate(isoString) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
        return `${diffMins} min`;
    } else {
        const diffHrs = Math.floor(diffMins / 60);
        return `${diffHrs} h ${diffMins % 60} min`;
    }
}

// Función para comprobar si un jugador ha cumplido el call time obligatorio
function hasPlayerCompletedCallTime(player) {
    if (!player.startTime) {
        return false;
    }
    
    const startTime = new Date(player.startTime);
    const now = new Date();
    const diffMs = now - startTime;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    // Buscar la mesa asociada para obtener el call time
    const table = tables.find(t => t.id === player.table);
    if (!table || !table.callTime) {
        return false;
    }
    
    // Convertir callTime a número
    const requiredHours = parseInt(table.callTime);
    
    // Verificar si ha pasado el tiempo requerido
    return diffHrs >= requiredHours;
}
