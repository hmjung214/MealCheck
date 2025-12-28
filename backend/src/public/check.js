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

// 조회 전용 토큰 (운영 시 env/서버 주입으로 교체 가능)
const VIEW_TOKEN = 'MEALCHECK_VIEW_TOKEN_2025';

statsBtn.addEventListener('click', () => {
  window.location.href = `/public/index.html?token=${VIEW_TOKEN}`;
});

loadPhone();
