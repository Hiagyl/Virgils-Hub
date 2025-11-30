// Enhanced hash router: keeps nav link active and updates on page change
(function () {
  const routes = {};
  document.querySelectorAll('.view.route').forEach(v => {
    routes[v.dataset.path] = v;
  });

  function setActiveLink(path) {
    document.querySelectorAll('.nav a[data-route]').forEach(a => {
      const href = a.getAttribute('href');
      // compare href and path (example: href="#/dashboard")
      const isActive = href === `#${path}`;
      a.classList.toggle('active', isActive);
    });
  }

  function show(path) {
    // default route
    if (!path || !routes[path]) path = '/dashboard';
    // toggle views
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    routes[path].classList.add('active');
    // set active nav link
    setActiveLink(path);
  }

  function onHashChange() {
    const path = (location.hash || '#/dashboard').slice(1);
    show(path);
  }

  // Activate data-route links (prevent full reloads)
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[data-route]');
    if (!a) return;
    e.preventDefault(); // stop default jump
    const target = a.getAttribute('href').slice(1);
    show(target);
    history.pushState(null, '', a.getAttribute('href')); // update hash
  });

  window.addEventListener('hashchange', onHashChange);
  // initial load
  onHashChange();
})();
