const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Todo는 JSON 파일에 저장 (서버/앱을 재시작해도 유지됨)
const DATA_FILE = process.env.TODO_DATA_FILE || path.join(__dirname, 'todos.json');

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return { todos: [], nextId: 1 };
  }
}

function saveState(state) {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8');
}

let state = loadState();

// 목록 조회
app.get('/todos', (req, res) => {
  res.json(state.todos);
});

// Todo 추가
app.post('/todos', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title은 비어있지 않은 문자열이어야 합니다.' });
  }

  const todo = {
    id: state.nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  state.todos.push(todo);
  saveState(state);

  res.status(201).json(todo);
});

// 완료 체크 토글/수정
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const todo = state.todos.find((t) => t.id === id);

  if (!todo) {
    return res.status(404).json({ error: '해당 id의 todo를 찾을 수 없습니다.' });
  }

  if (typeof req.body.done === 'boolean') {
    todo.done = req.body.done;
  }
  if (typeof req.body.title === 'string' && req.body.title.trim()) {
    todo.title = req.body.title.trim();
  }
  saveState(state);

  res.json(todo);
});

// 삭제
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const index = state.todos.findIndex((t) => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: '해당 id의 todo를 찾을 수 없습니다.' });
  }

  state.todos.splice(index, 1);
  saveState(state);

  res.status(204).end();
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API 서버 실행 중: http://localhost:${PORT}`);
  });
}

module.exports = app;
