import bcrypt from 'bcryptjs';
import { db } from '../src/db.js';

const force = process.argv.includes('--force');

const existing = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
if (existing > 0 && !force) {
  console.log(`Base déjà initialisée (${existing} utilisateurs). Utilisez --force pour réinitialiser.`);
  process.exit(0);
}
if (force) {
  db.exec('DELETE FROM reports; DELETE FROM users;');
  console.log('Base réinitialisée.');
}

const hash = bcrypt.hashSync('demo1234', 10);

const admin = db
  .prepare("INSERT INTO users (name, email, password_hash, city, role) VALUES (?, ?, ?, ?, 'admin')")
  .run('Admin CleanTun', 'admin@cleantun.tn', hash, 'Tunis');

const citizens = [
  ['Amine Ben Salah', 'amine@cleantun.tn', 'Tunis'],
  ['Sarra Trabelsi', 'sarra@cleantun.tn', 'Sfax'],
  ['Mohamed Gharbi', 'mohamed@cleantun.tn', 'Sousse'],
  ['Rania Jlassi', 'rania@cleantun.tn', 'Ariana'],
  ['Youssef Khemiri', 'youssef@cleantun.tn', 'Ben Arous'],
].map(([name, email, city]) =>
  Number(
    db
      .prepare('INSERT INTO users (name, email, password_hash, city) VALUES (?, ?, ?, ?)')
      .run(name, email, hash, city).lastInsertRowid,
  ),
);

const reports = [
  // Tunis
  { u: 0, type: 'dump', lat: 36.8065, lng: 10.1785, city: 'Tunis', status: 'resolved', days: 12, updated: 5,
    desc: 'Décharge sauvage près de Bab Souika, plusieurs sacs entassés depuis des jours.', addr: 'Bab Souika, Tunis' },
  { u: 0, type: 'overflow', lat: 36.838, lng: 10.175, city: 'Tunis', status: 'in_progress', days: 6, updated: 2,
    desc: 'Bennes débordantes chaque matin devant le marché.', addr: 'Mutuelleville, Tunis' },
  { u: 0, type: 'burning', lat: 36.842, lng: 10.165, city: 'Tunis', status: 'reported', days: 3,
    desc: 'Brûlage de déchets plastiques en pleine nuit, odeur insupportable.', addr: 'El Menzah 6, Tunis' },
  { u: 1, type: 'dump', lat: 36.843, lng: 10.275, city: 'Tunis', status: 'reported', days: 2,
    desc: 'Encombrants et gravats déposés sur le trottoir.', addr: 'Lac 2, Tunis' },
  { u: 1, type: 'water', lat: 36.83, lng: 10.23, city: 'Tunis', status: 'in_progress', days: 8, updated: 3,
    desc: 'Déchets flottants et pollution visible au bord du lac.', addr: 'Lac de Tunis' },
  { u: 3, type: 'recycling', lat: 36.8625, lng: 10.1956, city: 'Ariana', status: 'reported', days: 4,
    desc: 'Point de tri saturé, il faudrait une collecte plus fréquente.', addr: 'Ariana Ville' },
  { u: 0, type: 'overflow', lat: 36.7995, lng: 10.183, city: 'Tunis', status: 'resolved', days: 20, updated: 14,
    desc: 'Poubelles débordantes près de Bab El Bhar.', addr: 'Bab El Bhar, Tunis' },
  // Sfax
  { u: 1, type: 'dump', lat: 34.737, lng: 10.758, city: 'Sfax', status: 'reported', days: 5,
    desc: 'Dépôt illégal de déchets de construction.', addr: 'Bab Jebli, Sfax' },
  { u: 1, type: 'overflow', lat: 34.74, lng: 10.76, city: 'Sfax', status: 'in_progress', days: 9, updated: 4,
    desc: 'Conteneurs plein à craquer, rats dans le quartier.', addr: 'Centre-ville, Sfax' },
  { u: 1, type: 'burning', lat: 34.72, lng: 10.78, city: 'Sfax', status: 'reported', days: 1,
    desc: 'Feu de déchets près de la zone industrielle.', addr: 'Zone industrielle, Sfax' },
  // Sousse
  { u: 2, type: 'dump', lat: 35.825, lng: 10.635, city: 'Sousse', status: 'resolved', days: 15, updated: 10,
    desc: 'Déchets ménagers laissés près de la médina.', addr: 'Médina, Sousse' },
  { u: 2, type: 'overflow', lat: 35.827, lng: 10.655, city: 'Sousse', status: 'reported', days: 3,
    desc: 'Poubelles non vidées depuis une semaine.', addr: 'Boujaafar, Sousse' },
  { u: 2, type: 'dump', lat: 35.822, lng: 10.64, city: 'Sousse', status: 'reported', days: 7,
    desc: 'Sacs de poubelle jetés derrière le stade.', addr: 'Sahloul, Sousse' },
  // Autres gouvernorats
  { u: 3, type: 'water', lat: 37.283, lng: 9.87, city: 'Bizerte', status: 'in_progress', days: 10, updated: 6,
    desc: 'Déchets industriels rejetés près du port.', addr: 'Port de Bizerte' },
  { u: 4, type: 'dump', lat: 35.678, lng: 10.096, city: 'Kairouan', status: 'reported', days: 4,
    desc: 'Décharge sauvage en bordure de route.', addr: 'Route de Kairouan Sud' },
  { u: 4, type: 'dump', lat: 33.88, lng: 10.098, city: 'Gabès', status: 'rejected', days: 18, updated: 12,
    desc: 'Signalement signalé comme non fondé par les services municipaux.', addr: 'Gabès Ville' },
];

const insert = db.prepare(
  `INSERT INTO reports (user_id, type, description, lat, lng, address, city, status, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), datetime('now', ?))`,
);

for (const r of reports) {
  insert.run(
    citizens[r.u] ?? citizens[0],
    r.type,
    r.desc,
    r.lat,
    r.lng,
    r.addr,
    r.city,
    r.status,
    `${-r.days} days`,
    `${-(r.updated ?? r.days)} days`,
  );
}

db.exec(`
  UPDATE users SET points = (
    SELECT COALESCE(SUM(CASE WHEN r.status = 'resolved' THEN 20 ELSE 10 END), 0)
    FROM reports r WHERE r.user_id = users.id
  ) WHERE role = 'citizen';
`);

const users = db.prepare('SELECT COUNT(*) AS n FROM users').get().n;
const total = db.prepare('SELECT COUNT(*) AS n FROM reports').get().n;
console.log(`✅ Seed terminé : ${users} utilisateurs (dont 1 admin), ${total} signalements.`);
console.log('Comptes démo : admin@cleantun.tn / demo1234 — citoyens @cleantun.tn / demo1234');
console.log(`Admin créé avec l'id ${Number(admin.lastInsertRowid)}`);
