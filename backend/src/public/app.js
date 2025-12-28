const params = new URLSearchParams(window.location.search);
const token = params.get('token');

if (!token) {
  alert('조회 토큰이 없습니다.');
}

const apiBase = '/api/public/stats';
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5분

async function loadToday() {
  try {
    const res = await fetch(`${apiBase}/today?token=${token}`);
    const data = await res.json();

    document.getElementById('today-date').innerText = data.date;
    document.getElementById('today-staff').innerText = data.staff;
    document.getElementById('today-guests').innerText = data.guests;
    document.getElementById('today-total').innerText = data.total;
  } catch (e) {
    console.error('오늘 통계 갱신 실패', e);
  }
}

async function loadMonth() {
  try {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const res = await fetch(`${apiBase}/month?month=${month}&token=${token}`);
    const data = await res.json();

    document.getElementById('month-staff').innerText = data.staff;
    document.getElementById('month-guests').innerText = data.guests;
    document.getElementById('month-total').innerText = data.total;
  } catch (e) {
    console.error('월별 통계 갱신 실패', e);
  }
}

loadToday();
loadMonth();

// 자동 새로고침
setInterval(() => {
  loadToday();
  loadMonth();
}, REFRESH_INTERVAL);