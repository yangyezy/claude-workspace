const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const store = require('./store');
const { syncCalendar, getCredentials } = require('./icloud-sync');

dotenv.config({ path: process.env.ICLOUD_CONFIG_FILE || path.join(__dirname, '.env') });

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 목록 조회
app.get('/todos', (req, res) => {
  res.json(store.getTodos());
});

// Todo 추가
app.post('/todos', (req, res) => {
  const { title } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'title은 비어있지 않은 문자열이어야 합니다.' });
  }

  const todo = store.addTodo({ title });
  res.status(201).json(todo);
});

// 완료 체크 토글/수정
app.patch('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const patch = {};

  if (typeof req.body.done === 'boolean') {
    patch.done = req.body.done;
  }
  if (typeof req.body.title === 'string' && req.body.title.trim()) {
    patch.title = req.body.title.trim();
  }

  const todo = store.updateTodo(id, patch);
  if (!todo) {
    return res.status(404).json({ error: '해당 id의 todo를 찾을 수 없습니다.' });
  }
  res.json(todo);
});

// 삭제
app.delete('/todos/:id', (req, res) => {
  const id = Number(req.params.id);
  const deleted = store.deleteTodo(id);

  if (!deleted) {
    return res.status(404).json({ error: '해당 id의 todo를 찾을 수 없습니다.' });
  }
  res.status(204).end();
});

// 아이클라우드 캘린더 동기화 상태
const syncStatus = {
  enabled: Boolean(getCredentials()),
  lastSyncedAt: null,
  lastError: null,
};

app.get('/sync-status', (req, res) => {
  res.json(syncStatus);
});

async function runCalendarSync() {
  if (!getCredentials()) {
    syncStatus.enabled = false;
    return;
  }

  syncStatus.enabled = true;
  try {
    const result = await syncCalendar();
    syncStatus.lastSyncedAt = result.syncedAt;
    syncStatus.lastError = null;
  } catch (err) {
    syncStatus.lastError = err.message;
  }
}

const SYNC_INTERVAL_MS = 15 * 60 * 1000;

// 서버가 listen 중인지와 무관하게(Electron에 내장된 경우 포함) 캘린더 동기화를 예약
runCalendarSync();
setInterval(runCalendarSync, SYNC_INTERVAL_MS);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Todo API 서버 실행 중: http://localhost:${PORT}`);
  });
}

module.exports = app;
