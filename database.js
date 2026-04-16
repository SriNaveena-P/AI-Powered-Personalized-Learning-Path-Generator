const path = require('path');
const fs   = require('fs');

// Simple JSON file database - no build tools needed!
const DB_FILE = path.join(__dirname, 'db.json');

function loadDB() {
  if (!fs.existsSync(DB_FILE)) {
    const empty = { users:[], learning_paths:[], topics:[], quiz_attempts:[], skill_gaps:[], badges:[], resources:[], _id:{ users:1, learning_paths:1, topics:1, quiz_attempts:1, skill_gaps:1, badges:1, resources:1 } };
    fs.writeFileSync(DB_FILE, JSON.stringify(empty, null, 2));
  }
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

function saveDB(db) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2));
}

function nextId(db, table) {
  db._id[table] = (db._id[table] || 1);
  return db._id[table]++;
}

const db = {
  prepare: (sql) => ({
    run: (...args) => runSQL(sql, args),
    get: (...args) => getSQL(sql, args),
    all: (...args) => allSQL(sql, args),
  }),
  exec: () => {},
  pragma: () => {}
};

function runSQL(sql, args) {
  const data = loadDB();
  const s = sql.trim().toUpperCase();

  if (s.startsWith('INSERT INTO')) {
    const table = sql.match(/INSERT INTO (\w+)/i)[1];
    const id = nextId(data, table);
    const now = new Date().toISOString();
    let obj = { id, created_at: now };

    if (table === 'users') {
      obj = { id, name:args[0], email:args[1], password:args[2], goal:args[3]||'', skill_level:args[4]||'Beginner', hours_per_week:args[5]||5, learning_style:args[6]||'visual', xp_total:0, level:1, streak_days:0, best_streak:0, last_active:args[7]||now, created_at:now };
    } else if (table === 'learning_paths') {
      obj = { id, user_id:args[0], goal:args[1], skill_level:args[2], total_weeks:args[3], status:args[4]||'active', created_at:now };
    } else if (table === 'topics') {
      obj = { id, path_id:args[0], title:args[1], description:args[2]||'', content:args[6]||'', week_number:args[3], order_index:args[4], difficulty:args[5]||'beginner', youtube_url:args[7]||'', status:'pending', completed_at:null, created_at:now };
    } else if (table === 'quiz_attempts') {
      obj = { id, user_id:args[0], topic_name:args[1], score:args[2], total_questions:args[3], score_pct:args[4], created_at:now };
    } else if (table === 'skill_gaps') {
      obj = { id, user_id:args[0], topic:args[1], score_pct:args[2], severity:args[3]||'medium', resolved:0, created_at:now };
    } else if (table === 'badges') {
      obj = { id, user_id:args[0], name:args[1], description:args[2]||'', earned_at:now };
    } else if (table === 'resources') {
      obj = { id, topic_id:args[0], title:args[1], url:args[2], type:args[3]||'video' };
    }

    data[table].push(obj);
    saveDB(data);
    return { lastInsertRowid: id, changes: 1 };
  }

  if (s.startsWith('UPDATE')) {
    const table = sql.match(/UPDATE (\w+)/i)[1];
    const whereMatch = sql.match(/WHERE (.+)/i);
    if (whereMatch) {
      const whereStr = whereMatch[1].trim();
      const idMatch  = whereStr.match(/id\s*=\s*\?/i);
      const uidMatch = whereStr.match(/user_id\s*=\s*\?/i);
      const emailMatch = whereStr.match(/email\s*=\s*\?/i);
      const topicMatch = whereStr.match(/topic\s*=\s*\?/i);

      data[table] = data[table].map(row => {
        let match = false;
        const lastArg = args[args.length-1];
        const secondLastArg = args[args.length-2];
        if (idMatch  && row.id       == lastArg) match = true;
        if (uidMatch && row.user_id  == lastArg) match = true;
        if (emailMatch && row.email  == lastArg) match = true;
        if (topicMatch && uidMatch && row.user_id == secondLastArg && row.topic == lastArg) match = true;
        if (!match) return row;

        // parse SET clause
        const setStr = sql.match(/SET (.+?) WHERE/is)?.[1] || '';
        const setPairs = setStr.split(',').map(s => s.trim());
        const updated = { ...row };
        let argIdx = 0;
        for (const pair of setPairs) {
          const [col] = pair.split('=').map(s => s.trim());
          const cleanCol = col.toLowerCase().replace(/[^a-z_]/g,'');
          if (cleanCol && args[argIdx] !== undefined) {
            if (pair.toLowerCase().includes("datetime('now')") || pair.toLowerCase().includes('datetime("now")')) {
              updated[cleanCol] = new Date().toISOString();
            } else {
              updated[cleanCol] = args[argIdx++];
            }
          }
        }
        return updated;
      });
    }
    saveDB(data);
    return { changes: 1 };
  }

  return { changes: 0 };
}

function getSQL(sql, args) {
  const data = loadDB();
  const table = sql.match(/FROM (\w+)/i)?.[1];
  if (!table || !data[table]) return null;

  let rows = [...data[table]];
  rows = applyWhere(sql, rows, args);
  if (sql.toLowerCase().includes('order by')) {
    rows = rows.sort((a,b) => (a.created_at||'') < (b.created_at||'') ? 1 : -1);
  }
  return rows[0] || null;
}

function allSQL(sql, args) {
  const data = loadDB();
  const table = sql.match(/FROM (\w+)/i)?.[1];
  if (!table || !data[table]) return [];

  let rows = [...data[table]];
  rows = applyWhere(sql, rows, args);

  if (sql.toLowerCase().includes('order by created_at desc')) rows.sort((a,b) => (a.created_at||'') < (b.created_at||'') ? 1 : -1);
  else if (sql.toLowerCase().includes('order by week_number')) rows.sort((a,b) => (a.week_number||0)-(b.week_number||0) || (a.order_index||0)-(b.order_index||0));
  else if (sql.toLowerCase().includes('order by score_pct asc')) rows.sort((a,b) => (a.score_pct||0)-(b.score_pct||0));
  else if (sql.toLowerCase().includes('order by earned_at desc')) rows.sort((a,b) => (a.earned_at||'') < (b.earned_at||'') ? 1 : -1);

  const limitMatch = sql.match(/LIMIT (\d+)/i);
  if (limitMatch) rows = rows.slice(0, parseInt(limitMatch[1]));
  return rows;
}

function applyWhere(sql, rows, args) {
  const whereStr = sql.match(/WHERE (.+?)(?:ORDER|LIMIT|$)/is)?.[1]?.trim();
  if (!whereStr || !args.length) return rows;
  let argIdx = 0;
  const conditions = whereStr.split(/\s+AND\s+/i);
  for (const cond of conditions) {
    const col = cond.match(/(\w+)\s*[=<>]/)?.[1]?.toLowerCase();
    const val = args[argIdx++];
    if (!col || val === undefined) continue;
    if (cond.includes('!=')) rows = rows.filter(r => r[col] != val);
    else if (cond.includes('<'))  rows = rows.filter(r => r[col] <  val);
    else if (cond.includes('>'))  rows = rows.filter(r => r[col] >  val);
    else rows = rows.filter(r => String(r[col]) === String(val));
  }
  return rows;
}

console.log('✅ Database ready (JSON)');
module.exports = db;