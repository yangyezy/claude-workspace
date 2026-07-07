const form = document.getElementById('add-form');
const input = document.getElementById('title-input');
const list = document.getElementById('todo-list');
const errorEl = document.getElementById('error');
const syncErrorEl = document.getElementById('sync-error');
const plusBtn = document.getElementById('add-icon-btn');

function showError(message) {
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function clearError() {
  errorEl.hidden = true;
}

function formatDueDate(iso) {
  const d = new Date(iso);
  const dateStr = d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric', weekday: 'short' });
  const timeStr = d.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' });
  return `${dateStr} ${timeStr}`;
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

    const title = document.createElement('span');
    title.className = 'title';
    if (todo.source === 'calendar') {
      const badge = document.createElement('span');
      badge.className = 'calendar-badge';
      badge.textContent = todo.dueAt ? `📅 ${formatDueDate(todo.dueAt)}` : '📅';
      badge.title = '아이클라우드 캘린더에서 가져온 일정';
      title.appendChild(badge);
    }
    title.appendChild(document.createTextNode(todo.title));

    const checkBtn = document.createElement('button');
    checkBtn.type = 'button';
    checkBtn.className = 'check-box';
    checkBtn.setAttribute('aria-label', '완료 체크');
    checkBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none"><path d="M4 12.5L9.5 18L20 6" stroke="#6f9ceb" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    checkBtn.addEventListener('click', () => toggleDone(todo.id, !todo.done));

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '×';
    deleteBtn.setAttribute('aria-label', '삭제');
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    li.appendChild(title);
    li.appendChild(checkBtn);
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

plusBtn.addEventListener('click', () => {
  form.requestSubmit();
});

async function checkSyncStatus() {
  try {
    const res = await fetch('/sync-status');
    const status = await res.json();

    if (status.lastError) {
      syncErrorEl.textContent = '아이클라우드 캘린더 동기화 실패: ' + status.lastError;
      syncErrorEl.hidden = false;
    } else {
      syncErrorEl.hidden = true;
    }
  } catch (err) {
    // 상태 조회 자체가 실패해도 화면 동작에는 영향 없음
  }
}

loadTodos();
checkSyncStatus();

// 캘린더 동기화(서버 쪽 15분 주기)로 추가/삭제된 항목을 화면에 반영하기 위해 주기적으로 새로고침
setInterval(loadTodos, 30 * 1000);
setInterval(checkSyncStatus, 60 * 1000);
