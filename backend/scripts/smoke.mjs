import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const tmpDb = path.join(os.tmpdir(), `cleantun-smoke-${Date.now()}.db`);
process.env.DB_PATH = tmpDb;
process.env.JWT_SECRET = 'smoke-secret';

const { app } = await import('../src/app.js');

const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

async function api(method, url, { token, body, form } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';
  const res = await fetch(base + url, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null };
}

const t = Date.now();
const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

try {
  // auth
  const reg = await api('POST', '/api/auth/register', {
    body: { name: 'Amine', email: `amine${t}@cleantun.tn`, password: 'secret123', city: 'Tunis' },
  });
  assert.equal(reg.status, 201, 'register 201');
  assert.ok(reg.data.token, 'register returns token');
  assert.equal(reg.data.user.points, 0, 'new user has 0 points');
  const token = reg.data.token;

  const dup = await api('POST', '/api/auth/register', {
    body: { name: 'Amine2', email: `amine${t}@cleantun.tn`, password: 'secret123' },
  });
  assert.equal(dup.status, 409, 'duplicate email 409');

  const badLogin = await api('POST', '/api/auth/login', {
    body: { email: `amine${t}@cleantun.tn`, password: 'wrong' },
  });
  assert.equal(badLogin.status, 401, 'bad login 401');

  const login = await api('POST', '/api/auth/login', {
    body: { email: `amine${t}@cleantun.tn`, password: 'secret123' },
  });
  assert.equal(login.status, 200, 'login 200');

  const me = await api('GET', '/api/auth/me', { token });
  assert.equal(me.status, 200, 'me 200');
  assert.equal(me.data.user.name, 'Amine', 'me name');

  // reports CRUD
  const noAuth = await api('POST', '/api/reports', {
    form: (() => {
      const f = new FormData();
      f.set('type', 'dump');
      f.set('lat', '36.8065');
      f.set('lng', '10.1815');
      return f;
    })(),
  });
  assert.equal(noAuth.status, 401, 'create without token 401');

  const form = new FormData();
  form.set('type', 'dump');
  form.set('description', 'Décharge sauvage près du marché');
  form.set('lat', '36.8065');
  form.set('lng', '10.1815');
  form.set('city', 'Tunis');
  form.set('photo', new Blob([png], { type: 'image/png' }), 'dump.png');

  const created = await api('POST', '/api/reports', { token, form });
  assert.equal(created.status, 201, 'create report 201');
  assert.ok(created.data.photo, 'photo saved');
  const reportId = created.data.id;

  const list = await api('GET', '/api/reports?type=dump&city=Tunis');
  assert.equal(list.status, 200, 'list 200');
  assert.ok(Array.isArray(list.data) && list.data.length >= 1, 'list has report');

  const nearby = await api('GET', '/api/reports?lat=36.80&lng=10.18&radius=5');
  assert.equal(nearby.status, 200, 'nearby 200');
  assert.ok(nearby.data[0].distance_km !== undefined, 'distance computed');

  const invalid = await api('POST', '/api/reports', {
    token,
    form: (() => {
      const f = new FormData();
      f.set('type', 'nope');
      f.set('lat', '36');
      f.set('lng', '10');
      return f;
    })(),
  });
  assert.equal(invalid.status, 400, 'invalid type 400');

  // second user cannot delete
  const reg2 = await api('POST', '/api/auth/register', {
    body: { name: 'Sarra', email: `sarra${t}@cleantun.tn`, password: 'secret123', city: 'Sfax' },
  });
  const forbidden = await api('DELETE', `/api/reports/${reportId}`, { token: reg2.data.token });
  assert.equal(forbidden.status, 403, 'other user delete 403');

  // status update → points
  const patched = await api('PATCH', `/api/reports/${reportId}`, {
    token,
    body: { status: 'in_progress' },
  });
  assert.equal(patched.status, 200, 'patch 200');
  assert.equal(patched.data.status, 'in_progress', 'status updated');

  const resolved = await api('PATCH', `/api/reports/${reportId}`, {
    token,
    body: { status: 'resolved' },
  });
  assert.equal(resolved.data.status, 'resolved', 'resolved');

  const me2 = await api('GET', '/api/auth/me', { token });
  assert.equal(me2.data.user.points, 30, 'points = 10 create + 20 resolved');

  const again = await api('PATCH', `/api/reports/${reportId}`, {
    token,
    body: { status: 'resolved' },
  });
  assert.equal(again.status, 200, 're-resolve ok');
  const me3 = await api('GET', '/api/auth/me', { token });
  assert.equal(me3.data.user.points, 30, 'no double points on re-resolve');

  // stats + leaderboard
  const stats = await api('GET', '/api/stats');
  assert.equal(stats.status, 200, 'stats 200');
  assert.ok(stats.data.reports >= 1, 'stats reports');
  assert.ok(stats.data.byStatus.some((s) => s.status === 'resolved'), 'stats byStatus');

  const board = await api('GET', '/api/leaderboard');
  assert.equal(board.status, 200, 'leaderboard 200');
  assert.equal(board.data[0].name, 'Amine', 'leaderboard top');

  // admin moderation
  const citizenAdmin = await api('GET', '/api/admin/reports', { token: reg2.data.token });
  assert.equal(citizenAdmin.status, 403, 'admin route 403 for citizen');

  const { db } = await import('../src/db.js');
  db.prepare("UPDATE users SET role = 'admin' WHERE id = ?").run(reg.data.user.id);
  const jwt = (await import('jsonwebtoken')).default;
  const { JWT_SECRET } = await import('../src/middleware/auth.js');
  const adminToken = jwt.sign({ id: reg.data.user.id, role: 'admin' }, JWT_SECRET, { expiresIn: '7d' });

  const adminReports = await api('GET', '/api/admin/reports', { token: adminToken });
  assert.equal(adminReports.status, 200, 'admin reports 200');
  assert.ok(adminReports.data.some((r) => r.id === reportId && r.author_email), 'admin list has author_email');

  const adminUsers = await api('GET', '/api/admin/users', { token: adminToken });
  assert.equal(adminUsers.status, 200, 'admin users 200');
  assert.ok(adminUsers.data.some((u) => u.email === `sarra${t}@cleantun.tn`), 'admin users lists sarra');

  // delete
  const del = await api('DELETE', `/api/reports/${reportId}`, { token });
  assert.equal(del.status, 204, 'delete 204');
  const gone = await api('GET', `/api/reports/${reportId}`);
  assert.equal(gone.status, 404, 'deleted report 404');

  console.log('✅ Smoke test : tous les tests passent');
} catch (err) {
  console.error('❌ Smoke test échoué :', err.message);
  process.exitCode = 1;
} finally {
  server.close();
  const { db } = await import('../src/db.js');
  db.close();
  fs.rmSync(tmpDb, { force: true });
}
