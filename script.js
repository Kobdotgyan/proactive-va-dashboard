// ==========================================
// ProActive VA Dashboard - Core Logic
// ==========================================

// Data Storage Keys for localStorage
const STORAGE_KEYS = {
    CLIENTS: 'proactive_clients',
    TASKS: 'proactive_tasks'
};

// ==========================================
// Data Management Functions
// ==========================================

// Retrieve data from localStorage
function getData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

// Save data to localStorage
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// ==========================================
// Client Management
// ==========================================

function addClient(clientName, clientEmail, serviceType) {
    const clients = getData(STORAGE_KEYS.CLIENTS);
    
    const newClient = {
        id: Date.now(),
        name: clientName,
        email: clientEmail,
        service: serviceType,
        dateAdded: new Date().toISOString()
    };
    
    clients.push(newClient);
    saveData(STORAGE_KEYS.CLIENTS, clients);
    
    return newClient;
}

function getClients() {
    return getData(STORAGE_KEYS.CLIENTS);
}

// ==========================================
// Task Management
// ==========================================

function addTask(title, clientId, clientName, dueDate = '', status = 'todo', priority = 'medium', notes = '', tags = '') {
    const tasks = getData(STORAGE_KEYS.TASKS);
    
    const newTask = {
        id: Date.now(),
        title: title,
        clientId: clientId,
        clientName: clientName,
        status: status,
        priority: priority,
        dueDate: dueDate,
        notes: notes,
        tags: tags,
        dateCreated: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveData(STORAGE_KEYS.TASKS, tasks);
    
    return newTask;
}

function updateTask(taskId, updatedData) {
    const tasks = getData(STORAGE_KEYS.TASKS);
    const taskIndex = tasks.findIndex(t => t.id === taskId);

    if (taskIndex === -1) return;

    tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...updatedData
    };

    saveData(STORAGE_KEYS.TASKS, tasks);
}

function updateTaskStatus(taskId, newStatus) {
    const tasks = getData(STORAGE_KEYS.TASKS);
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        saveData(STORAGE_KEYS.TASKS, tasks);
    }
}

function deleteTask(taskId) {
    const tasks = getData(STORAGE_KEYS.TASKS);
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    saveData(STORAGE_KEYS.TASKS, filteredTasks);
}

function getTasks() {
    return getData(STORAGE_KEYS.TASKS);
}

// ==========================================
// Statistics Calculation
// ==========================================

function calculateStats() {
    const clients = getClients();
    const tasks = getTasks();
    
    const activeClients = clients.length;
    const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const completedThisWeek = tasks.filter(t => {
        return t.status === 'completed' && new Date(t.dateCreated) >= oneWeekAgo;
    }).length;
    
    return {
        activeClients: activeClients,
        pendingTasks: pendingTasks,
        completedThisWeek: completedThisWeek
    };
}

// ==========================================
// UI Rendering Functions
// ==========================================

function renderStats() {
    const stats = calculateStats();
    
    const clientsEl = document.getElementById('stat-clients');
    const pendingEl = document.getElementById('stat-pending');
    const completedEl = document.getElementById('stat-completed');

    if (clientsEl) clientsEl.textContent = stats.activeClients;
    if (pendingEl) pendingEl.textContent = stats.pendingTasks;
    if (completedEl) completedEl.textContent = stats.completedThisWeek;
}

function getPriorityLabel(priority = 'medium') {
    const labels = {
        high: 'High',
        medium: 'Medium',
        low: 'Low'
    };

    return labels[priority] || 'Medium';
}

function getVisibleTasks() {
    const tasks = getTasks();
    const searchInput = document.getElementById('task-search');
    const statusFilter = document.getElementById('task-status-filter');
    const priorityFilter = document.getElementById('task-priority-filter');

    const searchTerm = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedStatus = statusFilter ? statusFilter.value : 'all';
    const selectedPriority = priorityFilter ? priorityFilter.value : 'all';

    return tasks.filter(task => {
        const matchesSearch = !searchTerm ||
            task.title.toLowerCase().includes(searchTerm) ||
            task.clientName.toLowerCase().includes(searchTerm) ||
            (task.notes || '').toLowerCase().includes(searchTerm);

        const matchesStatus = selectedStatus === 'all' || task.status === selectedStatus;
        const matchesPriority = selectedPriority === 'all' || (task.priority || 'medium') === selectedPriority;

        return matchesSearch && matchesStatus && matchesPriority;
    }).sort((a, b) => {
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
    });
}

function renderTasks() {
    const visibleTasks = getVisibleTasks();
    const taskListContainer = document.getElementById('task-list');
    const taskResultsCount = document.getElementById('task-results-count');
    
    if (!taskListContainer) return;

    if (taskResultsCount) {
        taskResultsCount.textContent = `${visibleTasks.length} ${visibleTasks.length === 1 ? 'task' : 'tasks'}`;
    }

    if (visibleTasks.length === 0) {
        taskListContainer.innerHTML = '<p class="empty-state">No tasks match your current filters.</p>';
        return;
    }
    
    taskListContainer.innerHTML = '';
    
    visibleTasks.forEach(task => {
        const statusClass = `status-${task.status}`;
        const statusLabel = task.status === 'todo' ? 'To Do' : 
                           task.status === 'inprogress' ? 'In Progress' : 'Completed';
        const dueDateText = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {
            year: 'numeric', month: 'short', day: 'numeric'
        }) : 'No due date';
        const priorityValue = task.priority || 'medium';
        const priorityLabel = getPriorityLabel(priorityValue);
        const sanitizedNotes = (task.notes || '').trim();
        const tagList = (task.tags || '').split(',').map(tag => tag.trim()).filter(Boolean);
        
        const taskHTML = `
            <div class="task-item ${statusClass}">
                <div class="task-header">
                    <span class="task-title">${task.title}</span>
                    <span class="task-status">${statusLabel}</span>
                </div>
                <p class="task-client">Client: ${task.clientName}</p>

                <div class="task-chip-row">
                    <span class="task-chip priority-${priorityValue}">${priorityLabel} Priority</span>
                </div>

                ${sanitizedNotes ? `<p class="task-notes">${sanitizedNotes}</p>` : ''}

                ${tagList.length ? `
                    <div class="task-tags">
                        ${tagList.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
                    </div>
                ` : ''}

                <div class="task-meta">
                    <span class="task-due-date">Due: ${dueDateText}</span>
                </div>
                <div class="task-actions">
                    ${task.status === 'todo' ? 
                        `<button class="task-btn" onclick="moveTask(${task.id}, 'inprogress')">Start</button>` : 
                        ''}
                    ${task.status === 'inprogress' ? 
                        `<button class="task-btn" onclick="moveTask(${task.id}, 'completed')">Complete</button>` : 
                        ''}
                    <button class="task-btn edit-btn" onclick="openTaskModal(${task.id})">Edit</button>
                    <button class="task-btn delete-btn" onclick="removeTask(${task.id})">Delete</button>
                </div>
            </div>
        `;
        
        taskListContainer.innerHTML += taskHTML;
    });
}

// ==========================================
// Global Functions (Called from HTML onclick)
// ==========================================

function moveTask(taskId, newStatus) {
    updateTaskStatus(taskId, newStatus);
    renderTasks();
    renderStats();
}

function removeTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        deleteTask(taskId);
        renderTasks();
        renderStats();
    }
}

// ==========================================
// Event Listeners and Initialization
// ==========================================

function populateTaskClientOptions(selectedClientId = '') {
    const clients = getClients();
    const taskClientSelect = document.getElementById('task-client');
    if (!taskClientSelect) return;

    taskClientSelect.innerHTML = '<option value="">Select a client...</option>';

    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.name;

        if (String(client.id) === String(selectedClientId)) {
            option.selected = true;
        }

        taskClientSelect.appendChild(option);
    });
}

function openTaskModal(taskId = null) {
    const taskModal = document.getElementById('task-modal');
    const modalTitle = document.getElementById('task-modal-title');
    const taskIdInput = document.getElementById('task-id');
    const taskTitleInput = document.getElementById('task-title');
    const taskDueDateInput = document.getElementById('task-due-date');
    const taskStatusInput = document.getElementById('task-status');
    const taskPriorityInput = document.getElementById('task-priority');
    const taskNotesInput = document.getElementById('task-notes');
    const taskTagsInput = document.getElementById('task-tags');

    if (!taskModal) return;

    if (taskId !== null) {
        const task = getTasks().find(item => item.id === taskId);
        if (!task) return;

        populateTaskClientOptions(task.clientId);
        if (modalTitle) modalTitle.textContent = 'Edit Task';
        if (taskIdInput) taskIdInput.value = task.id;
        if (taskTitleInput) taskTitleInput.value = task.title;
        if (taskDueDateInput) taskDueDateInput.value = task.dueDate || '';
        if (taskStatusInput) taskStatusInput.value = task.status || 'todo';
        if (taskPriorityInput) taskPriorityInput.value = task.priority || 'medium';
        if (taskNotesInput) taskNotesInput.value = task.notes || '';
        if (taskTagsInput) taskTagsInput.value = task.tags || '';
    } else {
        populateTaskClientOptions();
        if (modalTitle) modalTitle.textContent = 'Create New Task';
        if (taskIdInput) taskIdInput.value = '';
        if (taskTitleInput) taskTitleInput.value = '';
        if (taskDueDateInput) taskDueDateInput.value = '';
        if (taskStatusInput) taskStatusInput.value = 'todo';
        if (taskPriorityInput) taskPriorityInput.value = 'medium';
        if (taskNotesInput) taskNotesInput.value = '';
        if (taskTagsInput) taskTagsInput.value = '';
    }

    taskModal.classList.remove('hidden');
    taskModal.setAttribute('aria-hidden', 'false');
}

function closeTaskModal() {
    const taskModal = document.getElementById('task-modal');
    if (!taskModal) return;

    taskModal.classList.add('hidden');
    taskModal.setAttribute('aria-hidden', 'true');

    const taskForm = document.getElementById('task-form');
    if (taskForm) taskForm.reset();
}

function showSuccessToast(message = 'Task created successfully.') {
    const toast = document.getElementById('success-toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');

    clearTimeout(showSuccessToast.timeoutId);
    showSuccessToast.timeoutId = setTimeout(() => {
        toast.classList.remove('show');
    }, 2200);
}

document.addEventListener('DOMContentLoaded', () => {
    const clientForm = document.getElementById('client-intake-form');
    const addTaskBtn = document.getElementById('add-task-btn');
    const taskForm = document.getElementById('task-form');
    const closeTaskModalBtn = document.getElementById('close-task-modal');
    const taskModal = document.getElementById('task-modal');
    const navLinks = document.querySelectorAll('.sidebar nav a');
    const taskSearchInput = document.getElementById('task-search');
    const taskStatusFilter = document.getElementById('task-status-filter');
    const taskPriorityFilter = document.getElementById('task-priority-filter');
    const clearTaskFiltersBtn = document.getElementById('clear-task-filters');

    if (clientForm) {
        clientForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const clientName = document.getElementById('client-name').value.trim();
            const clientEmail = document.getElementById('client-email').value.trim();
            const serviceType = document.getElementById('service-type').value;
            
            if (clientName && clientEmail && serviceType) {
                addClient(clientName, clientEmail, serviceType);
                clientForm.reset();
                renderStats();
                alert(`Client "${clientName}" added successfully!`);
            }
        });
    }
    
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', () => {
            const clients = getClients();
            
            if (clients.length === 0) {
                alert('Please add a client first before creating tasks.');
                return;
            }

            openTaskModal();
        });
    }

    if (taskForm) {
        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const taskId = document.getElementById('task-id').value;
            const taskTitle = document.getElementById('task-title').value.trim();
            const clientId = document.getElementById('task-client').value;
            const taskDueDate = document.getElementById('task-due-date').value;
            const taskStatus = document.getElementById('task-status').value;
            const taskPriority = document.getElementById('task-priority').value;
            const taskNotes = document.getElementById('task-notes').value.trim();
            const taskTags = document.getElementById('task-tags').value.trim();

            if (!taskTitle || !clientId) {
                alert('Please enter a task title and select a client.');
                return;
            }

            const selectedClient = getClients().find(client => String(client.id) === String(clientId));
            if (!selectedClient) {
                alert('Selected client was not found.');
                return;
            }

            if (taskId) {
                updateTask(Number(taskId), {
                    title: taskTitle,
                    clientId: selectedClient.id,
                    clientName: selectedClient.name,
                    dueDate: taskDueDate,
                    status: taskStatus,
                    priority: taskPriority,
                    notes: taskNotes,
                    tags: taskTags
                });

                showSuccessToast(`Task "${taskTitle}" updated successfully.`);
            } else {
                addTask(taskTitle, selectedClient.id, selectedClient.name, taskDueDate, taskStatus, taskPriority, taskNotes, taskTags);
                showSuccessToast(`Task "${taskTitle}" created successfully.`);
            }

            closeTaskModal();
            renderTasks();
            renderStats();
        });
    }

    if (closeTaskModalBtn) {
        closeTaskModalBtn.addEventListener('click', closeTaskModal);
    }

    if (taskModal) {
        taskModal.addEventListener('click', (event) => {
            if (event.target === taskModal) {
                closeTaskModal();
            }
        });
    }
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.parentElement.classList.remove('active'));
            link.parentElement.classList.add('active');
        });
    });

    if (taskSearchInput) {
        taskSearchInput.addEventListener('input', renderTasks);
    }

    if (taskStatusFilter) {
        taskStatusFilter.addEventListener('change', renderTasks);
    }

    if (taskPriorityFilter) {
        taskPriorityFilter.addEventListener('change', renderTasks);
    }

    if (clearTaskFiltersBtn) {
        clearTaskFiltersBtn.addEventListener('click', () => {
            if (taskSearchInput) taskSearchInput.value = '';
            if (taskStatusFilter) taskStatusFilter.value = 'all';
            if (taskPriorityFilter) taskPriorityFilter.value = 'all';
            renderTasks();
        });
    }
    
    renderStats();
    renderTasks();
});
