const form = document.getElementById('add-form');
const input = document.getElementById('title-input');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('error');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
}

function renderTodos(todos) {
  list.innerHTML = '';

  if (todos.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = '아직 할 일이 없어요.';
    list.appendChild(empty);
    return;
  }

  for (const todo of todos) {
    const li = document.createElement('li');
    li.className = 'todo-item' + (todo.done ? ' done' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', () => toggleDone(todo.id, checkbox.checked));

    const title = document.createElement('span');
    title.className = 'title';
    title.textContent = todo.title;

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(checkbox);
    li.appendChild(title);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  }
}

async function loadTodos() {
  const res = await fetch('/todos');
  const todos = await res.json();
  renderTodos(todos);
}

async function addTodo(title) {
  const res = await fetch('/todos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || '추가에 실패했습니다.');
  }
}

async function toggleDone(id, done) {
  await fetch(`/todos/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ done }),
  });
  loadTodos();
}

async function deleteTodo(id) {
  await fetch(`/todos/${id}`, { method: 'DELETE' });
  loadTodos();
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearError();

  const title = input.value.trim();
  if (!title) return;

  try {
    await addTodo(title);
    input.value = '';
    loadTodos();
  } catch (err) {
    showError(err.message);
  }
});

loadTodos();
