document.addEventListener('DOMContentLoaded', () => {
  // Inject Dark Mode Button
  const darkModeBtn = document.createElement('button');
  darkModeBtn.id = 'darkModeBtn';
  darkModeBtn.className = 'floating-btn visible';
  darkModeBtn.innerHTML = localStorage.getItem('theme') === 'dark' ? '☀️' : '🌙';
  document.body.appendChild(darkModeBtn);

  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
  }

  darkModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    darkModeBtn.innerHTML = isDark ? '☀️' : '🌙';
  });

  // Inject Back To Top Button
  const backBtn = document.createElement('button');
  backBtn.id = 'backToTopBtn';
  backBtn.className = 'floating-btn';
  backBtn.innerHTML = '↑';
  document.body.appendChild(backBtn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }
  });

  backBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
});
