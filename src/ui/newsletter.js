// Newsletter sign-up (markup: .tm-news in index.html / team.html / journal.html; styles: src/newsletter.css).
// Not connected to a mailing service yet: validates the address and thanks the visitor.
export function initNewsletter() {
  const form = document.getElementById('tm-news-form');
  const msg = document.getElementById('tm-news-msg');
  form?.addEventListener('submit', e => {
    e.preventDefault();
    const input = form.elements.email;
    if (!input.value.trim() || !input.checkValidity()) {
      msg.textContent = 'Please enter a valid email address.'; msg.classList.add('is-error'); input.focus(); return;
    }
    msg.classList.remove('is-error');
    msg.textContent = 'Thanks, you’re on the list.';
    form.reset();
  });
}
