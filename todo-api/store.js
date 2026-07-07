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

function getTodos() {
  return state.todos;
}

function addTodo({ title, source = 'manual', calendarEventId = null }) {
  const todo = {
    id: state.nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
    source,
    calendarEventId,
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
