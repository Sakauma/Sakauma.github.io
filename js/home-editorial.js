// Progressive enhancement only: the page, email link and navigation need no JS.
(() => {
  const button = document.querySelector('.copy-email');
  const status = document.querySelector('.copy-status');
  const email = document.querySelector('.email');
  if (!button || !status || !email || !navigator.clipboard || !window.isSecureContext) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(email.textContent.trim());
      status.textContent = '邮箱已复制';
    } catch {
      status.textContent = '未能复制，请使用上方邮箱链接。';
    }
  });
})();
