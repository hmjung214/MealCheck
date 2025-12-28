const btn = document.getElementById('checkBtn');
const input = document.getElementById('phone');
const result = document.getElementById('result');

btn.addEventListener('click', async () => {
  const phone = input.value.trim();

  if (!/^\d{4}$/.test(phone)) {
    result.textContent = '휴대폰 끝 4자리를 입력하세요.';
    return;
  }

  btn.disabled = true;
  result.textContent = '처리 중...';

  try {
    const res = await fetch('/api/check-in', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone_last4: phone })
    });

    const data = await res.json();
    result.textContent = data.message;
  } catch (err) {
    result.textContent = '서버 오류가 발생했습니다.';
  } finally {
    btn.disabled = false;
  }
});
