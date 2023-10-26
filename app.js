document.addEventListener('DOMContentLoaded', () => {
      const newTodoInput = document.querySelector('#new-todo');
      const selectorOfUsers = document.querySelector('#user-todo');
      const addTaskButton = document.querySelector('.addTask-button');
      const todoList = document.querySelector('#todo-list');

      fetchUsersAndTasks();

      addTaskButton.addEventListener('click', (event) => {
            event.preventDefault();

            const taskTitle = newTodoInput.value;
            const userId = selectorOfUsers.value;
            const completed = false;
            const authorName = selectorOfUsers.options[selectorOfUsers.selectedIndex].text;

            if (taskTitle === '') {
                  alert('Введите текст новой задачи.');
                  return;
            } else if (userId === 'select user') {
                  alert('Выберите пользователя, от которого добавляется задача.');
                  return;
            }
            addTask(taskTitle, userId, completed, authorName);
            newTodoInput.value = '';
      })

      async function fetchUsersAndTasks() {
            if (!checkOnlineStatus()) {
                  return;
            }
            try {
                  const usersResponse = await fetch('https://jsonplaceholder.typicode.com/users');
                  if (!usersResponse.ok) {
                        throw new Error('Ошибка сети при получении пользователей!');
                  }
                  const users = await usersResponse.json();

                  // для селектора
                  users.forEach(user => {
                        const userOptionElement = document.createElement('option');
                        userOptionElement.id = 'option-' + user.id;
                        userOptionElement.value = user.id; // ID пользователя
                        userOptionElement.innerHTML = user.name;
                        selectorOfUsers.appendChild(userOptionElement);
                  });

                  for (const user of users) {
                        const tasksResponse = await fetch(`https://jsonplaceholder.typicode.com/todos?userId=${user.id}`);
                        if (!tasksResponse.ok) {
                              throw new Error('Ошибка сети при получении задач пользователя!');
                        }
                        const tasks = await tasksResponse.json();

                        tasks.forEach(task => {
                              renderTask(task, user.name);
                        });
                  }
            } catch (error) {
                  console.log(`Ошибка сети: ${error.message}`);
                  displayErrorMessage(`Произошла ошибка при работе сервиса. Пожалуйста, перезагрузите страницу или попробуйте позже.`);
            }
      }

      function renderTask(task, authorName) {
            const taskId = task.id;
            const taskTitle = task.title;
            const taskCompleted = task.completed;

            const listItem = document.createElement('li');
            listItem.className = 'todo-item';
            listItem.id = 'todo-' + taskId;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'checkbox';
            checkbox.checked = taskCompleted;

            // Изменение checkbox таски
            checkbox.addEventListener('click', (event) => {
                  event.preventDefault(); // Избегаем изменений до ответа от сервера
                  toggleTaskStatus(taskId, taskCompleted);
            });

            const taskDiv = document.createElement('div');
            taskDiv.className = 'task';

            const taskText = document.createElement('span');
            taskText.textContent = taskTitle;

            const bySpan = document.createElement('span');
            bySpan.textContent = ' by ';
            bySpan.style.fontStyle = 'italic';

            const authorSpan = document.createElement('span');
            authorSpan.textContent = authorName;
            authorSpan.style.fontWeight = 'bold';

            taskDiv.appendChild(taskText);
            taskDiv.appendChild(bySpan);
            taskDiv.appendChild(authorSpan);

            const deleteButton = document.createElement('span');
            deleteButton.className = 'close';
            deleteButton.innerHTML = 'X';

            // Удаление таски
            deleteButton.addEventListener('click', () => {
                  removeTask(taskId);
            });

            listItem.appendChild(checkbox);
            listItem.appendChild(taskDiv);
            listItem.appendChild(deleteButton);

            todoList.appendChild(listItem);
      }

      function displayErrorMessage(message) {
            // Показать сообщение об ошибке
            const errorForm = document.querySelector('.error-form');
            const errorMessage = document.querySelector('.error-message');
            errorMessage.textContent = message;
            errorForm.style.display = 'block';
      }

      function hideErrorMessage() {
            const errorForm = document.querySelector('.error-form');
            errorForm.style.display = 'none';
      }


      async function addTask(taskTitle, userId, completed, authorName) {
            if (!checkOnlineStatus()) {
                  return;
            }
            try {
                  const taskResponse = await fetch(`https://jsonplaceholder.typicode.com/todos`, {
                        method: 'POST',
                        body: JSON.stringify({
                              userId: userId,
                              title: taskTitle,
                              completed: completed,
                        }),
                        headers: {
                              'Content-type': 'application/json; charset=UTF-8'
                        }
                  });

                  console.log('Статус ответа сервера (addTask):', taskResponse.status);

                  if (!taskResponse.ok) {
                        throw new Error('Ошибка при добавлении задачи');
                  }

                  const newTask = await taskResponse.json();

                  // Добавляем задачу в интерфейс
                  renderTask(newTask, authorName);
                  alert('Задача добавлена.');
                  // Скрыть сообщение об ошибке
                  hideErrorMessage();

            } catch (error) {
                  console.log(`Ошибка сети: ${error.message}`);
                  displayErrorMessage(`Произошла ошибка при работе сервиса. Пожалуйста, перезагрузите страницу или попробуйте позже.`);
            }
      }

      async function removeTask(taskId) {
            if (!checkOnlineStatus()) {
                  return;
            }
            try {
                  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
                        method: 'DELETE',
                  });

                  console.log('Статус ответа сервера (removeTask):', response.status);

                  if (!response.ok) {
                        throw new Error('Ошибка сети!');
                  }

                  const taskToRemove = document.getElementById(`todo-${taskId}`);
                  if (taskToRemove) {
                        taskToRemove.remove();
                        // Скрыть сообщение об ошибке
                        hideErrorMessage();
                  }

            } catch (error) {
                  console.log(`Ошибка сети: ${error.message}`);
                  displayErrorMessage(`Произошла ошибка при работе сервиса. Пожалуйста, перезагрузите страницу или попробуйте позже.`);
            }
      }

      async function toggleTaskStatus(taskId, taskCompleted) {
            if (!checkOnlineStatus()) {
                  return;
            }
            const newStatus = !taskCompleted;
            try {
                  const response = await fetch(`https://jsonplaceholder.typicode.com/todos/${taskId}`, {
                        method: 'PATCH',
                        body: JSON.stringify({
                              completed: newStatus,
                        }),
                        headers: {
                              'Content-type': 'application/json; charset=UTF-8'
                        }
                  });

                  console.log('Статус ответа сервера (toggleTaskStatus):', response.status);

                  if (!response.ok) {
                        throw new Error('Ошибка сети!');
                  }

                  const updatedTask = await response.json();
                  const checkbox = document.getElementById(`todo-${taskId}`).querySelector('.checkbox');
                  checkbox.checked = updatedTask.completed;
                  // Скрыть сообщение об ошибке
                  hideErrorMessage();
            } catch (error) {
                  console.log(`Ошибка сети: ${error.message}`);
                  displayErrorMessage(`Произошла ошибка при работе сервиса. Пожалуйста, перезагрузите страницу или попробуйте позже.`);
            }
      }


      function checkOnlineStatus() {
            if (!navigator.onLine) {
                  displayErrorMessage(`Вы оффлайн. Подключитесь к интернету, чтобы выполнить это действие.`);
                  return false;
            }
            else {
                  hideErrorMessage();
                  return true;
            }
      }
})


