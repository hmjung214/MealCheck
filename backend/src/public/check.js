const phoneInput = document.getElementById('phone');
const saveBtn = document.getElementById('save');
const checkinBtn = document.getElementById('checkin');
const savedText = document.getElementById('saved');
const resultText = document.getElementById('result');

function generateDeviceToken() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function getDeviceToken() {
  let token = localStorage.getItem('device_token');
  if (!token) {
    token = generateDeviceToken();
    localStorage.setItem('device_token', token);
  }
  return token;
}

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

  const device_token = getDeviceToken();
  resultText.textContent = '처리 중...';
  checkinBtn.disabled = true;

  try {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_last4, device_token }),
      signal: controller.signal
    });

    const data = await res.json();

    if (!res.ok) {
      resultText.textContent = data.message || '오류 발생';
      resultText.className = 'result error';
      return;
    }

    resultText.textContent = data.message || '완료';
    resultText.className = 'result success';
  } catch (e) {
    console.error(e);
    resultText.textContent = '네트워크 오류가 발생했습니다.';
    resultText.className = 'result error';
  } finally {
    checkinBtn.disabled = false;
  }
});

loadPhone();

// 개발/관리자용 토큰 초기화 (필요 시)
// window.resetDeviceToken = () => localStorage.removeItem('device_token');
