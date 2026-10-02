// =====================================================================
// DATA MODULE
// Handles data generation and state tracking
// =====================================================================
const DataManager = (() => {
    let taskCounter = 0;

    return {
        getNextId: () => {
            taskCounter++;
            return `task-${taskCounter}`;
        }
    };
})();

// =====================================================================
// UTILITY MODULE
// Handles validation and helper functions
// =====================================================================
const UtilityModule = (() => {
    const validateText = (text) => {
        return text && text.trim().length > 0;
    };

    return {
        validateText
    };
})();

// =====================================================================
// DISPLAY MODULE
// Handles DOM creation, updates, and UI rendering
// =====================================================================
const DisplayModule = (() => {
    // Cache DOM elements
    const taskList = document.getElementById('taskList');
    const taskInput = document.getElementById('taskInput');
    const taskMessage = document.getElementById('taskMessage');
    const totalCount = document.getElementById('totalCount');
    const pendingCount = document.getElementById('pendingCount');
    const completedCount = document.getElementById('completedCount');

    const showMessage = (msg) => {
        taskMessage.textContent = msg;
    };

    const clearMessage = () => {
        taskMessage.textContent = '';
    };

    // Required Function: createTaskElement
    const createTaskElement = (taskText, taskId) => {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.taskId = taskId;
        li.dataset.state = 'pending';

        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = taskText; // Secure: using textContent

        const completeBtn = document.createElement('button');
        completeBtn.className = 'complete-btn';
        completeBtn.textContent = 'Complete';

        const editBtn = document.createElement('button');
        editBtn.className = 'edit-btn';
        editBtn.textContent = 'Edit';

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';

        li.append(span, completeBtn, editBtn, removeBtn);
        return li;
    };

    // Required Function: updateTaskCounts
    const updateTaskCounts = () => {
        const tasks = taskList.querySelectorAll('.task-item');
        const total = tasks.length;
        let completed = 0;
        
        tasks.forEach(task => {
            if (task.dataset.state === 'completed') {
                completed++;
            }
        });
        
        const pending = total - completed;

        totalCount.textContent = total;
        pendingCount.textContent = pending;
        completedCount.textContent = completed;
    };

    return {
        taskList,
        taskInput,
        showMessage,
        clearMessage,
        createTaskElement,
        updateTaskCounts
    };
})();

// =====================================================================
// MAIN MODULE
// Handles application logic, state changes, and event delegation
// =====================================================================
const MainModule = (() => {
    // Required Function: addTask
    const addTask = (taskText) => {
        if (!UtilityModule.validateText(taskText)) {
            DisplayModule.showMessage('Task cannot be empty');
            return;
        }
        
        DisplayModule.clearMessage();
        const taskId = DataManager.getNextId();
        const taskEl = DisplayModule.createTaskElement(taskText.trim(), taskId);
        
        DisplayModule.taskList.appendChild(taskEl);
        DisplayModule.taskInput.value = '';
        DisplayModule.updateTaskCounts();
    };

    // Required Function: toggleTaskComplete
    const toggleTaskComplete = (taskItem) => {
        taskItem.classList.toggle('completed');
        const isCompleted = taskItem.classList.contains('completed');
        taskItem.dataset.state = isCompleted ? 'completed' : 'pending';
        DisplayModule.updateTaskCounts();
    };

    // Required Function: beginTaskEdit
    const beginTaskEdit = (taskItem) => {
        const textSpan = taskItem.querySelector('.task-text');
        const currentText = textSpan.textContent;
        
        const input = document.createElement('input');
        input.className = 'edit-input';
        input.type = 'text';
        input.value = currentText;
        
        taskItem.replaceChild(input, textSpan);
        
        const editBtn = taskItem.querySelector('.edit-btn');
        editBtn.textContent = 'Save';
    };

    // Required Function: saveTaskEdit
    const saveTaskEdit = (taskItem) => {
        const input = taskItem.querySelector('.edit-input');
        const newText = input.value;
        
        if (!UtilityModule.validateText(newText)) {
            DisplayModule.showMessage('Task cannot be empty');
            return;
        }
        
        DisplayModule.clearMessage();
        
        const span = document.createElement('span');
        span.className = 'task-text';
        span.textContent = newText.trim(); // Secure: using textContent
        
        taskItem.replaceChild(span, input);
        
        const editBtn = taskItem.querySelector('.edit-btn');
        editBtn.textContent = 'Edit';
    };

    // Required Function: removeTask
    const removeTask = (taskItem) => {
        taskItem.remove();
        DisplayModule.updateTaskCounts();
    };

    // Required Function: handleTaskListClick (Event Delegation)
    const handleTaskListClick = (event) => {
        const taskItem = event.target.closest('.task-item');
        if (!taskItem) return;

        if (event.target.matches('.complete-btn')) {
            toggleTaskComplete(taskItem);
        } 
        else if (event.target.matches('.edit-btn')) {
            // If it's currently in edit mode, save it. Otherwise, begin edit.
            if (taskItem.querySelector('.edit-input')) {
                saveTaskEdit(taskItem);
            } else {
                beginTaskEdit(taskItem);
            }
        } 
        else if (event.target.matches('.remove-btn')) {
            removeTask(taskItem);
        }
    };

    // Required Function: loadSampleTasks
    const loadSampleTasks = () => {
        const fragment = document.createDocumentFragment();
        const samples = [
            'Review DOM selectors',
            'Practice createElement',
            'Study event delegation'
        ];

        samples.forEach(text => {
            const taskId = DataManager.getNextId();
            const taskEl = DisplayModule.createTaskElement(text, taskId);
            fragment.appendChild(taskEl);
        });

        DisplayModule.taskList.appendChild(fragment);
        DisplayModule.updateTaskCounts();
    };

    // Initialization
    const init = () => {
        // Bind main controls
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            addTask(DisplayModule.taskInput.value);
        });

        document.getElementById('loadSamplesBtn').addEventListener('click', loadSampleTasks);

        // Allow adding tasks via 'Enter' key
        DisplayModule.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask(DisplayModule.taskInput.value);
            }
        });

        // Bind the SINGLE delegated event listener to the task list
        DisplayModule.taskList.addEventListener('click', handleTaskListClick);
        
        // Initial count render
        DisplayModule.updateTaskCounts();
    };

    return { init };
})();

// Start the application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', MainModule.init);