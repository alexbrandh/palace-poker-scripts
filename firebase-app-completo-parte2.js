function editPlayer(playerId) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        // Configurar el formulario para editar
        if (playerForm) {
            document.getElementById('player-name').value = player.name;
            document.getElementById('player-game-type').value = player.gameType;
            document.getElementById('player-stake').value = player.stake;
            document.getElementById('player-status').value = player.status;
            
            // Opciones adicionales dependiendo del status
            const additionalOptionsContainer = document.getElementById('additional-options-container');
            if (additionalOptionsContainer) {
                if (player.status === 'Jugando') {
                    additionalOptionsContainer.style.display = 'block';
                    
                    // Crear select para la mesa asociada si no existe
                    let tableSelect = document.getElementById('table-select');
                    if (!tableSelect) {
                        tableSelect = document.createElement('select');
                        tableSelect.id = 'table-select';
                        tableSelect.className = 'form-control';
                        
                        const tableSelectLabel = document.createElement('label');
                        tableSelectLabel.htmlFor = 'table-select';
                        tableSelectLabel.textContent = 'Mesa:';
                        
                        const formGroup = document.createElement('div');
                        formGroup.className = 'form-group';
                        formGroup.appendChild(tableSelectLabel);
                        formGroup.appendChild(tableSelect);
                        
                        additionalOptionsContainer.appendChild(formGroup);
                    }
                    
                    // Poblar el select con las mesas disponibles
                    tableSelect.innerHTML = '';
                    tables.forEach(table => {
                        if (table.active) {
                            const option = document.createElement('option');
                            option.value = table.id;
                            option.textContent = `Mesa ${table.number} - ${table.gameType} (${table.stake})`;
                            tableSelect.appendChild(option);
                        }
                    });
                    
                    // Seleccionar la mesa actual si existe
                    if (player.table) {
                        tableSelect.value = player.table;
                    }
                    
                    // Asiento
                    let seatInput = document.getElementById('seat-input');
                    if (!seatInput) {
                        seatInput = document.createElement('input');
                        seatInput.type = 'number';
                        seatInput.id = 'seat-input';
                        seatInput.className = 'form-control';
                        seatInput.min = 1;
                        seatInput.max = 9;
                        
                        const seatLabel = document.createElement('label');
                        seatLabel.htmlFor = 'seat-input';
                        seatLabel.textContent = 'Asiento:';
                        
                        const formGroup = document.createElement('div');
                        formGroup.className = 'form-group';
                        formGroup.appendChild(seatLabel);
                        formGroup.appendChild(seatInput);
                        
                        additionalOptionsContainer.appendChild(formGroup);
                    }
                    
                    // Establecer el asiento actual si existe
                    if (player.seat) {
                        seatInput.value = player.seat;
                    } else {
                        seatInput.value = '';
                    }
                    
                    // Call time
                    let startTimeInput = document.getElementById('start-time-input');
                    if (!startTimeInput) {
                        startTimeInput = document.createElement('input');
                        startTimeInput.type = 'datetime-local';
                        startTimeInput.id = 'start-time-input';
                        startTimeInput.className = 'form-control';
                        
                        const startTimeLabel = document.createElement('label');
                        startTimeLabel.htmlFor = 'start-time-input';
                        startTimeLabel.textContent = 'Hora de inicio:';
                        
                        const formGroup = document.createElement('div');
                        formGroup.className = 'form-group';
                        formGroup.appendChild(startTimeLabel);
                        formGroup.appendChild(startTimeInput);
                        
                        additionalOptionsContainer.appendChild(formGroup);
                    }
                    
                    // Establecer la hora de inicio actual si existe
                    if (player.startTime) {
                        // Convertir la fecha ISO a formato local para datetime-local input
                        const localDateTime = new Date(player.startTime).toISOString().slice(0, 16);
                        startTimeInput.value = localDateTime;
                    } else {
                        // Si no hay hora de inicio, usar la hora actual
                        const now = new Date();
                        const localDateTime = now.toISOString().slice(0, 16);
                        startTimeInput.value = localDateTime;
                    }
                } else {
                    additionalOptionsContainer.style.display = 'none';
                    // Limpiar opciones adicionales
                    additionalOptionsContainer.innerHTML = '';
                }
            }
            
            // Cambia el botón del formulario a "Actualizar" y añade el ID del jugador
            const submitButton = playerForm.querySelector('button[type="submit"]');
            submitButton.textContent = 'Actualizar Jugador';
            submitButton.dataset.edit = 'true';
            submitButton.dataset.playerId = playerId;
        }
    }
}

// Funciones para añadir datos de demostración
function addDemoTablesData() {
    const demoTables = [
        {
            id: generateId(),
            number: '1',
            gameType: 'Texas NLHE',
            stake: '$25/$50',
            availableSeats: 4,
            status: 'active',
            active: true,
            buyinMin: '2000',
            buyinMax: '5000',
            callTime: '2',
            timestamp: new Date().toISOString()
        },
        {
            id: generateId(),
            number: '2',
            gameType: 'Texas NLHE',
            stake: '$50/$100',
            availableSeats: 2,
            status: 'active',
            active: true,
            buyinMin: '5000',
            buyinMax: '15000',
            callTime: '3',
            timestamp: new Date().toISOString()
        },
        {
            id: generateId(),
            number: '3',
            gameType: 'Omaha PLO',
            stake: '$100/$100',
            availableSeats: 6,
            status: 'active',
            active: true,
            buyinMin: '10000',
            buyinMax: '50000',
            callTime: '3',
            timestamp: new Date().toISOString()
        },
        {
            id: generateId(),
            number: '4',
            gameType: 'Texas/Omaha',
            stake: 'Botón $50/$200',
            availableSeats: 0,
            status: 'active',
            active: true,
            buyinMin: '5000',
            buyinMax: '20000',
            callTime: '3',
            timestamp: new Date().toISOString()
        }
    ];
    
    // Añadir mesas una por una a Firebase
    demoTables.forEach(table => {
        tablesRef.child(table.id).set(table);
    });
}

function addDemoPlayersData() {
    const demoPlayers = [
        {
            id: generateId(),
            name: 'Juan Pérez',
            gameType: 'Texas NLHE',
            stake: '25/50',
            status: 'Presente',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
            isNew: false
        },
        {
            id: generateId(),
            name: 'María González',
            gameType: 'Texas NLHE',
            stake: '50/100',
            status: 'Presente',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
            isNew: false
        },
        {
            id: generateId(),
            name: 'Carlos Rodríguez',
            gameType: 'Omaha PLO',
            stake: '100/200',
            status: 'Jugando',
            table: '3', // ID de la mesa 3
            seat: 4,
            startTime: new Date(Date.now() - 60 * 60000).toISOString(), // Inicio hace 1 hora
            timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
            isNew: false
        },
        {
            id: generateId(),
            name: 'Ana Martínez',
            gameType: 'Texas/Omaha',
            stake: '100/200',
            status: 'Ausente',
            timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
            isNew: false
        }
    ];
    
    // Añadir jugadores uno por uno a Firebase
    demoPlayers.forEach(player => {
        playersRef.child(player.id).set(player);
    });
}

// Función para limpiar todos los datos (útil para reiniciar)
function clearAllData() {
    // Mostrar confirmación
    const confirmation = confirm("¿Estás seguro de que quieres borrar TODOS los datos? Esta acción no se puede deshacer.");
    
    if (confirmation) {
        // Borrar todas las mesas
        tablesRef.remove()
            .then(() => {
                console.log("Todas las mesas han sido eliminadas");
                
                // Borrar todos los jugadores
                return playersRef.remove();
            })
            .then(() => {
                console.log("Todos los jugadores han sido eliminados");
                showToast('Éxito', 'Todos los datos han sido eliminados', 'success');
                
                // Reiniciar arrays locales
                tables = [];
                players = [];
                
                // Actualizar UI
                renderActiveTables();
                renderWaitingLists();
                renderAdminTablesList();
                renderAdminWaitingLists();
                
                // Preguntar si se quieren añadir datos de demostración
                const addDemo = confirm("¿Quieres añadir datos de demostración?");
                if (addDemo) {
                    addDemoTablesData();
                    addDemoPlayersData();
                }
            })
            .catch(error => {
                console.error("Error limpiando datos:", error);
                showToast('Error', `No se pudieron limpiar los datos: ${error.message}`, 'error');
            });
    }
}

// Setup all event listeners
function setupEventListeners() {
    // Admin button
    if (adminButton) {
        adminButton.addEventListener('click', () => {
            loginModal.style.display = 'block';
        });
    }
    
    // Close modals
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }
    
    if (closeAdminModal) {
        closeAdminModal.addEventListener('click', () => {
            adminDashboard.style.display = 'none';
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (event.target === adminDashboard) {
            adminDashboard.style.display = 'none';
        }
    });
    
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Credenciales simplificadas para demostración
            if (username === 'admin' && password === 'palace123') {
                loginModal.style.display = 'none';
                adminDashboard.style.display = 'block';
                
                // Actualizar las listas en el panel de admin
                renderAdminTablesList();
                renderAdminWaitingLists();
            } else {
                alert('Credenciales incorrectas. Por favor, inténtalo de nuevo.');
            }
        });
    }
    
    // Tab buttons
    if (tabButtons) {
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                
                // Desactivar todos los botones y contenido de pestañas
                tabButtons.forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                // Activar el botón y contenido seleccionados
                button.classList.add('active');
                document.getElementById(`${tabName}-tab`).classList.add('active');
            });
        });
    }
    
    // Table form
    if (tableForm) {
        tableForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const number = document.getElementById('table-number').value;
            const gameType = document.getElementById('game-type').value;
            const stake = document.getElementById('stake').value;
            const buyinMin = document.getElementById('buyinMin').value;
            const buyinMax = document.getElementById('buyinMax').value;
            const availableSeats = document.getElementById('availableSeats').value;
            const status = document.getElementById('tableStatus').value;
            const callTime = document.getElementById('callTime').value;
            
            const tableData = {
                number,
                gameType,
                stake,
                buyinMin,
                buyinMax,
                availableSeats: parseInt(availableSeats),
                status,
                callTime,
                active: status === 'active',
                timestamp: new Date().toISOString()
            };
            
            const submitButton = tableForm.querySelector('button[type="submit"]');
            
            if (submitButton.dataset.edit === 'true') {
                // Actualizar mesa existente
                const tableId = submitButton.dataset.tableId;
                updateTable(tableId, tableData);
                
                // Restablecer el botón
                submitButton.textContent = 'Activar Mesa';
                submitButton.dataset.edit = 'false';
                delete submitButton.dataset.tableId;
            } else {
                // Verificar si ya existe una mesa con ese número
                const existingTable = tables.find(t => t.number === number);
                if (existingTable) {
                    const confirm = window.confirm(`Ya existe una mesa con el número ${number}. ¿Quieres actualizarla?`);
                    if (confirm) {
                        updateTable(existingTable.id, tableData);
                    }
                } else {
                    // Añadir nueva mesa
                    addTable(tableData);
                }
            }
            
            // Limpiar formulario
            tableForm.reset();
        });
    }
