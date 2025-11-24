// script.pro.js — small UX helpers: form fallback, year, and minimal validation
document.addEventListener('DOMContentLoaded',()=>{
  // set year
  const y = new Date().getFullYear();
  const el = document.getElementById('year');
  if(el) el.textContent = String(y);

  const form = document.getElementById('contactForm');
  const status = document.getElementById('status');
  if(!form) return;

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const name = (fd.get('name')||'').toString().trim();
    const email = (fd.get('email')||'').toString().trim();
    const message = (fd.get('message')||'').toString().trim();

    if(!name || !email || !message){
      status.textContent = 'Please complete all fields.';
      status.style.color = '#ffb4a2';
      return;
    }

    // Try navigator.share for mobile, else fallback to mailto
    const subject = encodeURIComponent(`Contact from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    const mailto = `mailto:?subject=${subject}&body=${body}`;

    // Open mail client
    window.location.href = mailto;
    status.textContent = 'Opening your email client…';
    status.style.color = '#9ae6b4';
  });
});
