const phoneInput = document.getElementById('phone');
const saveBtn = document.getElementById('save');
const checkinBtn = document.getElementById('checkin');
const savedText = document.getElementById('saved');
const resultText = document.getElementById('result');

function loadPhone() {
  const v = localStorage.getItem('phone_last4');
  if (v) {
    phoneInput.value = v;
    savedText.textContent = `저장됨: ${v}`;
  }
}

saveBtn.addEventListener('click', () => {
  const v = (phoneInput.value || '').trim();
  if (!/^\d{4}$/.test(v)) {
    alert('휴대폰 끝 4자리를 입력하세요.');
    return;
  }
  localStorage.setItem('phone_last4', v);
  savedText.textContent = `저장됨: ${v}`;
});

checkinBtn.addEventListener('click', async () => {
  const phone_last4 = (localStorage.getItem('phone_last4') || '').trim();
  if (!/^\d{4}$/.test(phone_last4)) {
    alert('휴대폰 끝 4자리를 먼저 저장하세요.');
    return;
  }

  resultText.textContent = '처리 중...';

  try {
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_last4 })
    });

    const data = await res.json();
    resultText.textContent = data.message || '완료';
  } catch (e) {
    resultText.textContent = '오류가 발생했습니다.';
  }
});

const statsBtn = document.getElementById('goStats');

statsBtn.addEventListener('click', () => {
  // 식당/회계 전용: 로컬에 토큰이 없으면 1회 입력받아 저장
  let viewToken = localStorage.getItem('view_token');

  if (!viewToken) {
    viewToken = prompt('통계 조회 토큰을 입력하세요 (식당/회계 전용)');
    if (!viewToken) return;
    localStorage.setItem('view_token', viewToken.trim());
    viewToken = viewToken.trim();
  }

  window.location.href = `/public/index.html?token=${encodeURIComponent(viewToken)}`;
});

loadPhone();
