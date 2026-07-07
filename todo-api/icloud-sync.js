const { createDAVClient } = require('tsdav');
const ical = require('node-ical');
const store = require('./store');

const SYNC_RANGE_DAYS = 7;

function getCredentials() {
  const appleId = process.env.ICLOUD_APPLE_ID;
  const appPassword = process.env.ICLOUD_APP_PASSWORD;
  if (!appleId || !appPassword) return null;
  return { appleId, appPassword };
}

async function fetchUpcomingEvents(days) {
  const credentials = getCredentials();
  if (!credentials) {
    const err = new Error('아이클라우드 계정 정보가 설정되지 않았습니다.');
    err.code = 'ICLOUD_NOT_CONFIGURED';
    throw err;
  }

  const client = await createDAVClient({
    serverUrl: 'https://caldav.icloud.com',
    credentials: {
      username: credentials.appleId,
      password: credentials.appPassword,
    },
    authMethod: 'Basic',
    defaultAccountType: 'caldav',
  });

  const calendars = await client.fetchCalendars();

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + days);

  const events = [];

  for (const calendar of calendars) {
    const objects = await client.fetchCalendarObjects({
      calendar,
      timeRange: {
        start: start.toISOString(),
        end: end.toISOString(),
      },
    });

    for (const obj of objects) {
      if (!obj.data) continue;

      let parsed;
      try {
        parsed = ical.sync.parseICS(obj.data);
      } catch (err) {
        continue;
      }

      for (const key of Object.keys(parsed)) {
        const component = parsed[key];
        if (component.type !== 'VEVENT' || !component.uid || !component.summary) continue;

        events.push({
          uid: component.uid,
          title: component.summary,
          dueAt: component.start instanceof Date ? component.start.toISOString() : null,
        });
      }
    }
  }

  return events;
}

async function syncCalendar() {
  const events = await fetchUpcomingEvents(SYNC_RANGE_DAYS);
  const seenIds = new Set(events.map((e) => e.uid));

  // 캘린더에서 사라진 일정은 Todo에서도 삭제
  const calendarTodos = store.getTodos().filter((t) => t.source === 'calendar');
  for (const todo of calendarTodos) {
    if (!seenIds.has(todo.calendarEventId)) {
      store.deleteTodo(todo.id);
    }
  }

  let added = 0;
  for (const event of events) {
    const existingTodo = store.findByCalendarEventId(event.uid);
    if (!existingTodo) {
      store.addTodo({
        title: event.title,
        source: 'calendar',
        calendarEventId: event.uid,
        dueAt: event.dueAt,
      });
      added += 1;
    } else if (existingTodo.title !== event.title || existingTodo.dueAt !== event.dueAt) {
      // 일정이 캘린더에서 수정(제목/시간 변경)되면 Todo에도 반영
      store.updateTodo(existingTodo.id, { title: event.title, dueAt: event.dueAt });
    }
  }

  return { total: events.length, added, syncedAt: new Date().toISOString() };
}

module.exports = { syncCalendar, getCredentials };
