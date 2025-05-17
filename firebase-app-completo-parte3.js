    // Player form
    if (playerForm) {
        playerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const name = document.getElementById('player-name').value;
            const gameType = document.getElementById('player-game-type').value;
            const stake = document.getElementById('player-stake').value;
            const status = document.getElementById('player-status').value;
            
            let playerData = {
                name,
                gameType,
                stake,
                status,
                timestamp: new Date().toISOString(),
                isNew: true
            };
            
            // Si el status es "Jugando", recoger información adicional
            if (status === 'Jugando') {
                const tableSelect = document.getElementById('table-select');
                const seatInput = document.getElementById('seat-input');
                const startTimeInput = document.getElementById('start-time-input');
                
                if (tableSelect && tableSelect.value) {
                    playerData.table = tableSelect.value;
                }
                
                if (seatInput && seatInput.value) {
                    playerData.seat = parseInt(seatInput.value);
                }
                
                if (startTimeInput && startTimeInput.value) {
                    // Convertir el valor del input datetime-local a ISO string
                    const startTime = new Date(startTimeInput.value);
                    playerData.startTime = startTime.toISOString();
                }
            }
            
            const submitButton = playerForm.querySelector('button[type="submit"]');
            
            if (submitButton.dataset.edit === 'true') {
                // Actualizar jugador existente
                const playerId = submitButton.dataset.playerId;
                updatePlayer(playerId, playerData);
                
                // Restablecer el botón
                submitButton.textContent = 'Añadir Jugador';
                submitButton.dataset.edit = 'false';
                delete submitButton.dataset.playerId;
            } else {
                // Añadir nuevo jugador
                addPlayer(playerData);
            }
            
            // Limpiar formulario
            playerForm.reset();
            
            // Limpiar opciones adicionales si existen
            const additionalOptionsContainer = document.getElementById('additional-options-container');
            if (additionalOptionsContainer) {
                additionalOptionsContainer.style.display = 'none';
                additionalOptionsContainer.innerHTML = '';
            }
        });
        
        // Cambiar opciones adicionales según el estado seleccionado
        const playerStatusSelect = document.getElementById('player-status');
        if (playerStatusSelect) {
            playerStatusSelect.addEventListener('change', (e) => {
                const status = e.target.value;
                const additionalOptionsContainer = document.getElementById('additional-options-container');
                
                if (additionalOptionsContainer) {
                    if (status === 'Jugando') {
                        additionalOptionsContainer.style.display = 'block';
                        additionalOptionsContainer.innerHTML = '';
                        
                        // Mesa
                        const tableSelect = document.createElement('select');
                        tableSelect.id = 'table-select';
                        tableSelect.className = 'form-control';
                        
                        const tableSelectLabel = document.createElement('label');
                        tableSelectLabel.htmlFor = 'table-select';
                        tableSelectLabel.textContent = 'Mesa:';
                        
                        const tableFormGroup = document.createElement('div');
                        tableFormGroup.className = 'form-group';
                        tableFormGroup.appendChild(tableSelectLabel);
                        tableFormGroup.appendChild(tableSelect);
                        
                        additionalOptionsContainer.appendChild(tableFormGroup);
                        
                        // Poblar el select con las mesas disponibles
                        tables.forEach(table => {
                            if (table.active) {
                                const option = document.createElement('option');
                                option.value = table.id;
                                option.textContent = `Mesa ${table.number} - ${table.gameType} (${table.stake})`;
                                tableSelect.appendChild(option);
                            }
                        });
                        
                        // Asiento
                        const seatInput = document.createElement('input');
                        seatInput.type = 'number';
                        seatInput.id = 'seat-input';
                        seatInput.className = 'form-control';
                        seatInput.min = 1;
                        seatInput.max = 9;
                        
                        const seatLabel = document.createElement('label');
                        seatLabel.htmlFor = 'seat-input';
                        seatLabel.textContent = 'Asiento:';
                        
                        const seatFormGroup = document.createElement('div');
                        seatFormGroup.className = 'form-group';
                        seatFormGroup.appendChild(seatLabel);
                        seatFormGroup.appendChild(seatInput);
                        
                        additionalOptionsContainer.appendChild(seatFormGroup);
                        
                        // Hora de inicio
                        const startTimeInput = document.createElement('input');
                        startTimeInput.type = 'datetime-local';
                        startTimeInput.id = 'start-time-input';
                        startTimeInput.className = 'form-control';
                        
                        // Establecer la hora actual
                        const now = new Date();
                        const localDateTime = now.toISOString().slice(0, 16);
                        startTimeInput.value = localDateTime;
                        
                        const startTimeLabel = document.createElement('label');
                        startTimeLabel.htmlFor = 'start-time-input';
                        startTimeLabel.textContent = 'Hora de inicio:';
                        
                        const startTimeFormGroup = document.createElement('div');
                        startTimeFormGroup.className = 'form-group';
                        startTimeFormGroup.appendChild(startTimeLabel);
                        startTimeFormGroup.appendChild(startTimeInput);
                        
                        additionalOptionsContainer.appendChild(startTimeFormGroup);
                    } else {
                        additionalOptionsContainer.style.display = 'none';
                        additionalOptionsContainer.innerHTML = '';
                    }
                }
            });
        }
    }
    
    // Admin list filter
    if (adminListFilter) {
        adminListFilter.addEventListener('change', () => {
            renderAdminWaitingLists();
        });
    }
}

// Render active tables in the main view
function renderActiveTables() {
    // Filter tables that are active or in opening process
    const activeTables = tables.filter(table => table.active || table.status === 'opening');
    activeTablesContainer.innerHTML = '';
    
    if (activeTables.length === 0) {
        activeTablesContainer.innerHTML = '<p class="no-data">No hay mesas activas en este momento.</p>';
        return;
    }
    
    // Group tables by game type
    const groupedTables = groupBy(activeTables, table => `${table.gameType}`);
    
    // Create a section for each group
    for (const [gameType, groupTables] of Object.entries(groupedTables)) {
        const groupSection = document.createElement('div');
        groupSection.className = 'table-group fade-in';
        
        const groupHeader = document.createElement('h3');
        groupHeader.className = 'group-header';
        groupHeader.textContent = gameType;
        groupSection.appendChild(groupHeader);
        
        const groupTablesContainer = document.createElement('div');
        groupTablesContainer.className = 'group-tables';
        
        // Further group by stakes within this game type
        const stakeGroupedTables = groupBy(groupTables, table => table.stake);
        
        for (const [stake, stakesTables] of Object.entries(stakeGroupedTables)) {
            stakesTables.forEach(table => {
                const tableElement = document.createElement('div');
                tableElement.className = 'table-card';
                tableElement.dataset.id = table.id;
                
                // Establecer color basado en el stake
                if (table.stake.includes('$25/$50')) {
                    tableElement.classList.add('stake-low');
                } else if (table.stake.includes('$50/$50') || table.stake.includes('$50/$100')) {
                    tableElement.classList.add('stake-medium');
                } else if (table.stake.includes('$100/$100') || table.stake.includes('$100/$200')) {
                    tableElement.classList.add('stake-high');
                } else if (table.stake.includes('Botón')) {
                    tableElement.classList.add('stake-special');
                }
                
                // Estado (llena, disponible, etc.)
                let statusClass = '';
                let statusText = '';
                
                if (table.status === 'opening') {
                    statusClass = 'status-opening';
                    statusText = 'En apertura';
                } else if (parseInt(table.availableSeats) === 0) {
                    statusClass = 'status-full';
                    statusText = 'Llena';
                } else {
                    statusClass = 'status-available';
                    statusText = `${table.availableSeats} asientos disponibles`;
                }
                
                const tableHeader = document.createElement('div');
                tableHeader.className = 'table-header';
                tableHeader.innerHTML = `
                    <h4>Mesa ${table.number}</h4>
                    <span class="stake">${table.stake}</span>
                `;
                
                const tableContent = document.createElement('div');
                tableContent.className = 'table-content';
                tableContent.innerHTML = `
                    <div class="table-info">
                        <p class="game-type">${table.gameType}</p>
                        <p class="buyin-range">Buy-in: $${parseInt(table.buyinMin).toLocaleString()} - $${parseInt(table.buyinMax).toLocaleString()}</p>
                        <p class="seats ${statusClass}">${statusText}</p>
                    </div>
                `;
                
                // Obtener jugadores en esta mesa
                const tableId = table.id;
                const tablePlayers = players.filter(p => p.table === tableId && p.status === 'Jugando');
                
                // Si hay jugadores en la mesa, mostrarlos
                if (tablePlayers.length > 0) {
                    const playersContainer = document.createElement('div');
                    playersContainer.className = 'table-players';
                    
                    // Añadir encabezado
                    const playersHeader = document.createElement('h5');
                    playersHeader.textContent = 'Jugadores:';
                    playersContainer.appendChild(playersHeader);
                    
                    // Añadir lista de jugadores
                    const playersList = document.createElement('ul');
                    tablePlayers.forEach(player => {
                        const playerItem = document.createElement('li');
                        
                        // Verificar si el jugador ha cumplido el call time
                        const completedCallTime = hasPlayerCompletedCallTime(player);
                        
                        playerItem.className = completedCallTime ? 'call-time-complete' : '';
                        
                        playerItem.innerHTML = `
                            <span class="player-name">${player.name}</span>
                            <span class="player-seat">Asiento ${player.seat}</span>
                            ${completedCallTime ? '<span class="call-time-badge" title="Call time completado"><i class="fas fa-clock"></i></span>' : ''}
                        `;
                        
                        playersList.appendChild(playerItem);
                    });
                    playersContainer.appendChild(playersList);
                    
                    tableContent.appendChild(playersContainer);
                }
                
                tableElement.appendChild(tableHeader);
                tableElement.appendChild(tableContent);
                
                groupTablesContainer.appendChild(tableElement);
            });
        }
        
        groupSection.appendChild(groupTablesContainer);
        activeTablesContainer.appendChild(groupSection);
    }
}

// Render waiting lists in the main view
function renderWaitingLists() {
    // Filter players not playing
    const waitingPlayers = players.filter(player => player.status !== 'Jugando');
    waitingListsContainer.innerHTML = '';
    
    if (waitingPlayers.length === 0) {
        waitingListsContainer.innerHTML = '<p class="no-data">No hay jugadores en lista de espera en este momento.</p>';
        return;
    }
    
    // Group by game type and stake
    const groupedPlayers = groupBy(waitingPlayers, player => `${player.gameType} - ${player.stake}`);
    
    // Sort groups by popularity (number of players)
    const sortedGroups = Object.entries(groupedPlayers).sort((a, b) => b[1].length - a[1].length);
    
    // Create a waitlist for each group
    for (const [groupName, groupPlayers] of sortedGroups) {
        const waitingListElement = createPlayerGroup(groupName, groupPlayers);
        waitingListsContainer.appendChild(waitingListElement);
    }
}

// Render admin waiting lists
function renderAdminWaitingLists() {
    const filter = adminListFilter ? adminListFilter.value : 'all';
    let filteredPlayers = [];
    
    if (filter === 'all') {
        filteredPlayers = players;
    } else {
        filteredPlayers = players.filter(player => player.status === filter);
    }
    
    adminWaitingLists.innerHTML = '';
    
    if (filteredPlayers.length === 0) {
        adminWaitingLists.innerHTML = '<p class="no-data">No hay jugadores que coincidan con el filtro actual.</p>';
        return;
    }
    
    // Group by game type and stake
    const groupedPlayers = groupBy(filteredPlayers, player => `${player.gameType} - ${player.stake}`);
    
    // Create a waitlist for each group in the admin view
    for (const [groupName, groupPlayers] of Object.entries(groupedPlayers)) {
        const groupElement = document.createElement('div');
        groupElement.className = 'waiting-list fade-in';
        
        const groupHeader = document.createElement('h4');
        groupHeader.className = 'list-header';
        groupHeader.textContent = groupName;
        groupElement.appendChild(groupHeader);
        
        // Sort players by timestamp (oldest first)
        groupPlayers.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const playersList = document.createElement('ul');
        playersList.className = 'players-list';
        
        groupPlayers.forEach(player => {
            const playerItem = document.createElement('li');
            playerItem.className = 'player-item';
            if (player.isNew) {
                playerItem.classList.add('new-player');
            }
            
            const statusClass = player.status === 'Presente' ? 'status-present' :
                               player.status === 'Ausente' ? 'status-absent' :
                               player.status === 'Jugando' ? 'status-playing' : '';
            
            const waitTime = formatDate(player.timestamp);
            
            playerItem.innerHTML = `
                <div class="player-info">
                    <span class="player-name">${player.name}</span>
                    <span class="player-status ${statusClass}">${player.status}</span>
                    <span class="player-wait-time">Tiempo: ${waitTime}</span>
                </div>
                <div class="player-actions">
                    <button class="edit-player" data-id="${player.id}"><i class="fas fa-edit"></i></button>
                    <button class="delete-player" data-id="${player.id}"><i class="fas fa-trash"></i></button>
                </div>
            `;
            
            playersList.appendChild(playerItem);
        });
        
        groupElement.appendChild(playersList);
        adminWaitingLists.appendChild(groupElement);
    }
    
    // Add event listeners to the player action buttons
    addPlayerEventListeners();
}

// Render admin tables
function renderAdminTablesList() {
    adminTablesList.innerHTML = '';
    
    if (tables.length === 0) {
        adminTablesList.innerHTML = '<p class="no-data">No hay mesas configuradas.</p>';
        return;
    }
    
    const tablesList = document.createElement('div');
    tablesList.className = 'admin-tables fade-in';
    
    tables.forEach(table => {
        const tableItem = document.createElement('div');
        tableItem.className = 'table-item';
        tableItem.dataset.id = table.id;
        
        // Establecer color basado en el stake
        if (table.stake.includes('$25/$50')) {
            tableItem.classList.add('stake-low');
        } else if (table.stake.includes('$50/$50') || table.stake.includes('$50/$100')) {
            tableItem.classList.add('stake-medium');
        } else if (table.stake.includes('$100/$100') || table.stake.includes('$100/$200')) {
            tableItem.classList.add('stake-high');
        } else if (table.stake.includes('Botón')) {
            tableItem.classList.add('stake-special');
        }
        
        const tableStatus = table.active ? 'Activa' : 'Inactiva';
        const statusClass = table.active ? 'status-active' : 'status-inactive';
        
        tableItem.innerHTML = `
            <div class="table-info">
                <h4>Mesa ${table.number}</h4>
                <p>${table.gameType} - ${table.stake}</p>
                <p>Asientos: ${table.availableSeats} disponibles</p>
                <p>Buy-in: $${parseInt(table.buyinMin).toLocaleString()} - $${parseInt(table.buyinMax).toLocaleString()}</p>
                <p class="table-status ${statusClass}">${tableStatus}</p>
                <p>Call Time: ${table.callTime} horas</p>
            </div>
            <div class="table-actions">
                <button class="toggle-table" data-id="${table.id}">
                    ${table.active ? '<i class="fas fa-pause"></i> Pausar' : '<i class="fas fa-play"></i> Activar'}
                </button>
                <button class="edit-table" data-id="${table.id}"><i class="fas fa-edit"></i> Editar</button>
                <button class="delete-table" data-id="${table.id}"><i class="fas fa-trash"></i> Eliminar</button>
            </div>
        `;
        
        tablesList.appendChild(tableItem);
    });
    
    // Botón para limpiar todos los datos
    const clearDataButton = document.createElement('button');
    clearDataButton.className = 'clear-data-button';
    clearDataButton.innerHTML = '<i class="fas fa-trash-alt"></i> Borrar todos los datos';
    clearDataButton.addEventListener('click', clearAllData);
    
    adminTablesList.appendChild(tablesList);
    adminTablesList.appendChild(clearDataButton);
