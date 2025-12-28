// backend/src/db.js
// (레거시 호환용) 기존 require('./db') 를 유지하면서 내부는 pool 사용
module.exports = require('./db/pool');
