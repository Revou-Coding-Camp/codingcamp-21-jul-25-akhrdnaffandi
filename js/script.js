document.addEventListener('DOMContentLoaded', () => {
    const todoInput = document.getElementById('todoInput');
    const todoDesc = document.getElementById('todoDesc');
    const dateInput = document.getElementById('dateInput');
    const addTodoBtn = document.getElementById('addTodoBtn');
    const taskList = document.getElementById('taskList');
    const noTasksMessage = document.getElementById('noTasksMessage');

    const searchInput = document.getElementById('searchInput');
    const filterBtn = document.getElementById('filterBtn');
    const sortBtn = document.getElementById('sortBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');

    const totalTasksCount = document.getElementById('totalTasksCount');
    const completedTasksCount = document.getElementById('completedTasksCount');
    const pendingTasksCount = document.getElementById('pendingTasksCount');
    const progressPercentage = document.getElementById('progressPercentage');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    let currentFilter = 'all';
    let currentSort = 'none';
    let editIndex = null;

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
        updateStats();
    }

    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(task => task.completed).length;
        const pending = total - completed;
        const progress = total > 0 ? ((completed / total) * 100).toFixed(0) : 0;

        totalTasksCount.textContent = total;
        completedTasksCount.textContent = completed;
        pendingTasksCount.textContent = pending;
        progressPercentage.textContent = `${progress}%`;
    }

    function updateEmptyState() {
        const hasTasks = [...taskList.children].some(child => child.id !== 'noTasksMessage');
        noTasksMessage.style.display = hasTasks ? 'none' : 'block';
    }

    function renderTasks() {
        taskList.innerHTML = '';
        taskList.appendChild(noTasksMessage);

        let tasksToRender = [...tasks];

        const searchTerm = searchInput.value.toLowerCase();
        if (searchTerm) {
            tasksToRender = tasksToRender.filter(task =>
                task.text.toLowerCase().includes(searchTerm)
            );
        }

        if (currentFilter === 'pending') {
            tasksToRender = tasksToRender.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            tasksToRender = tasksToRender.filter(task => task.completed);
        }

        if (currentSort === 'alpha-asc') {
            tasksToRender.sort((a, b) => a.text.localeCompare(b.text));
        } else if (currentSort === 'alpha-desc') {
            tasksToRender.sort((a, b) => b.text.localeCompare(a.text));
        } else if (currentSort === 'date-asc') {
            tasksToRender.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
        } else if (currentSort === 'date-desc') {
            tasksToRender.sort((a, b) => new Date(b.dueDate || '0001-01-01') - new Date(a.dueDate || '0001-01-01'));
        }

        tasksToRender.forEach(task => {
            const originalIndex = tasks.indexOf(task);
            const formattedDueDate = task.dueDate
                ? new Date(task.dueDate + 'T00:00:00').toLocaleDateString('en-GB', {
                    year: 'numeric', month: 'short', day: 'numeric'
                }) : 'No Date';

            const taskItem = document.createElement('div');
            taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

            taskItem.innerHTML = `
                <div class="task-text">${task.text}</div>
                <div class="task-desc">${task.desc || '-'}</div>
                <div class="task-date">${formattedDueDate}</div>
                <div class="task-status">
                    <span class="status-label ${task.completed ? 'completed' : 'pending'}">
                        ${task.completed ? 'Completed' : 'Pending'}
                    </span>
                </div>
                <div class="task-actions">
                    <button class="action-btn toggle-btn" data-action="toggle" data-original-index="${originalIndex}" title="${task.completed ? 'Cancel Completed' : 'Mark Completed'}">
                        <i class="fas ${task.completed ? 'fa-arrows-rotate' : 'fa-check-double'}"></i>
                    </button>
                    <button class="action-btn edit-btn" data-action="edit" data-original-index="${originalIndex}" title="Edit Tasks">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn" data-action="delete" data-original-index="${originalIndex}" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            taskList.appendChild(taskItem);
        });

        updateEmptyState();
        updateStats();
    }

    // alert notif
    function showAlert(message) {
        const alertBox = document.getElementById('alertBox');
        alertBox.textContent = message;
        alertBox.classList.add('show');
    
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 2000); // tampil 2 detik
    }

    // fungsi callback
    function showConfirm(message, callback) {
        const confirmBox = document.getElementById('confirmBox');
        const confirmMessage = document.getElementById('confirmMessage');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
    
        confirmMessage.textContent = message;
        confirmBox.style.display = 'flex';
    
        const cleanup = () => {
            confirmBox.style.display = 'none';
            yesBtn.onclick = null;
            noBtn.onclick = null;
        };
    
        yesBtn.onclick = () => {
            callback(true);
            cleanup();
        };
    
        noBtn.onclick = () => {
            callback(false);
            cleanup();
        };
    }
    
    

    function addTodo() {
        const todoText = todoInput.value.trim();
        const descText = todoDesc.value.trim();
        const dueDate = dateInput.value;

        if (todoText === '') {
            alert('Masukkan nama tugas!');
            return;
        }

        if (editIndex !== null) {
            tasks[editIndex] = {
                ...tasks[editIndex],
                text: todoText,
                desc: descText,
                dueDate: dueDate
            };
            editIndex = null;
            addTodoBtn.innerHTML = '<i class="fas fa-plus"></i>Add Task';
            showAlert('Task Updated successfully!');
        } else {
            tasks.push({
                text: todoText,
                desc: descText,
                dueDate: dueDate,
                completed: false
            });
            showAlert('Task added successfully!');
        }
        

        saveTasks();

        todoInput.value = '';
        todoDesc.value = '';
        dateInput.value = '';

        renderTasks();
    }

    function deleteTask(index) {
        showConfirm('Are you sure you want to delete this task ?', (confirmed) => {
            if (confirmed) {
                tasks.splice(index, 1);
                saveTasks();
                renderTasks();
                showAlert('Task deleted successfully!');
            }
        });
    }
    

    function toggleStatus(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    function editTask(index) {
        const task = tasks[index];
        todoInput.value = task.text;
        todoDesc.value = task.desc || '';
        dateInput.value = task.dueDate || '';

        editIndex = index;
        addTodoBtn.innerHTML = '<i class="fas fa-pen"></i>Update Task';
        todoInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        todoInput.focus();
    }

    function handleTaskActions(e) {
        const btn = e.target.closest('button');
        if (!btn) return;

        const action = btn.dataset.action;
        const index = parseInt(btn.dataset.originalIndex);

        if (action === 'delete') {
            deleteTask(index);
        } else if (action === 'toggle') {
            toggleStatus(index);
        } else if (action === 'edit') {
            editTask(index);
        }
    }

    function toggleFilter() {
        // Hapus semua filter class
        filterBtn.classList.remove('filter-pending', 'filter-completed', 'filter-all');
    
        if (currentFilter === 'all') {
            currentFilter = 'pending';
            filterBtn.innerHTML = '<i class="fas fa-clock"></i> Pending';
            filterBtn.classList.add('filter-pending');
        } else if (currentFilter === 'pending') {
            currentFilter = 'completed';
            filterBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Completed';
            filterBtn.classList.add('filter-completed');
        } else {
            currentFilter = 'all';
            filterBtn.innerHTML = '<i class="fas fa-filter"></i> Filter';
            filterBtn.classList.add('filter-all');
        }
    
        renderTasks();
    }
    

    function toggleSort() {
        if (currentSort === 'none' || currentSort === 'date-desc') {
            currentSort = 'alpha-asc';
            sortBtn.innerHTML = '<i class="fas fa-sort-alpha-down"></i> Sort (A-Z)';
        } else if (currentSort === 'alpha-asc') {
            currentSort = 'alpha-desc';
            sortBtn.innerHTML = '<i class="fas fa-sort-alpha-up"></i> Sort (Z-A)';
        } else if (currentSort === 'alpha-desc') {
            currentSort = 'date-asc';
            sortBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Sort (Oldest)';
        } else if (currentSort === 'date-asc') {
            currentSort = 'date-desc';
            sortBtn.innerHTML = '<i class="fas fa-calendar-alt"></i> Sort (Newest)';
        }
        renderTasks();
    }

    function deleteAllTasks() {
        showConfirm('Delete all tasks ?', (confirmed) => {
            if (confirmed) {
                tasks = [];
                saveTasks();
                renderTasks();
                showAlert('All tasks have been deleted!');
            }
        });
    }
    

    addTodoBtn.addEventListener('click', addTodo);
    taskList.addEventListener('click', handleTaskActions);
    searchInput.addEventListener('keyup', renderTasks);
    filterBtn.addEventListener('click', toggleFilter);
    sortBtn.addEventListener('click', toggleSort);
    deleteAllBtn.addEventListener('click', deleteAllTasks);

    renderTasks();
    updateStats();
});
