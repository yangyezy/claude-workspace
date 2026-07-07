const express = require('express');

const app = express();
app.use(express.json());

// 메모리에 Todo 저장 (서버 재시작하면 초기화됨)
const todos = [];
let nextId = 1;

// Todo 추가
app.post('/todos', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title은 비어있지 않은 문자열이어야 합니다.' });
  }

  const todo = {
    id: nextId++,
    title: title.trim(),
    done: false,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);

  res.status(201).json(todo);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Todo API 서버 실행 중: http://localhost:${PORT}`);
});
