document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('textarea').forEach(t => {
    t.addEventListener('input', () => {
      t.style.height = 'auto';
      t.style.height = t.scrollHeight + 'px';
    });
    // Trigger on load
    if (t.scrollHeight > 0) {
      t.style.height = t.scrollHeight + 'px';
    }
  });
});
