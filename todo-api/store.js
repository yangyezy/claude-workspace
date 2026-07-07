const fs = require('fs');
const path = require('path');

const DATA_FILE = process.env.TODO_DATA_FILE || path.join(__dirname, 'todos.json');

function load() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { todos: [], nextId: 1 };
  }
}

let state = load();

function save() {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

// 일정 날짜(dueAt)가 있는 항목은 빠른 날짜 순으로, 날짜가 없는(수동 추가) 항목은 그 뒤에 이어 붙임
function getTodos() {
  const dated = state.todos
    .filter((t) => t.dueAt)
    .sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  const undated = state.todos.filter((t) => !t.dueAt);
  return [...dated, ...undated];
}

function addTodo({ title, source = 'manual', calendarEventId = null, dueAt = null }) {
  const todo = {
    id: state.nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
    source,
    calendarEventId,
    dueAt,
  };
  state.todos.push(todo);
  save();
  return todo;
}

function updateTodo(id, patch) {
  const todo = state.todos.find((t) => t.id === id);
  if (!todo) return null;
  Object.assign(todo, patch);
  save();
  return todo;
}

function deleteTodo(id) {
  const index = state.todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  state.todos.splice(index, 1);
  save();
  return true;
}

function findByCalendarEventId(calendarEventId) {
  return state.todos.find((t) => t.calendarEventId === calendarEventId);
}

module.exports = {
  getTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  findByCalendarEventId,
  DATA_FILE,
};
