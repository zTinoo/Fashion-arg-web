// ======================== SISTEMA DE USUARIOS ========================
let usuarios = [];
let currentUser = null;
let noticias = [];
let categorias = [];
let currentActiveTab = 'published';

function loadUsers() {
  const stored = localStorage.getItem('moda_usuarios');
  if (stored) {
    usuarios = JSON.parse(stored);
  } else {
    usuarios = [
      { id: 1, username: "admin", password: btoa("admin123"), email: "admin@moda.ar", role: "admin", createdAt: new Date().toISOString() }
    ];
    saveUsers();
  }
}
function saveUsers() { localStorage.setItem('moda_usuarios', JSON.stringify(usuarios)); }

function hashPassword(pass) { return btoa(pass); }
function verifyPassword(pass, hash) { return btoa(pass) === hash; }

function login(username, password) {
  const user = usuarios.find(u => u.username === username);
  if (user && verifyPassword(password, user.password)) {
    currentUser = { ...user, password: undefined };
    localStorage.setItem('moda_currentUser', JSON.stringify(currentUser));
    return true;
  }
  return false;
}
function register(username, password, email) {
  if (usuarios.find(u => u.username === username)) return false;
  const newId = Date.now();
  const newUser = {
    id: newId,
    username,
    password: hashPassword(password),
    email,
    role: "reader",
    createdAt: new Date().toISOString()
  };
  usuarios.push(newUser);
  saveUsers();
  return true;
}
function logout() {
  currentUser = null;
  localStorage.removeItem('moda_currentUser');
}
function checkStoredSession() {
  const stored = localStorage.getItem('moda_currentUser');
  if (stored) {
    currentUser = JSON.parse(stored);
    const exists = usuarios.find(u => u.id === currentUser.id);
    if (!exists) {
      currentUser = null;
      localStorage.removeItem('moda_currentUser');
    }
  }
  updateUIForUser();
}
function updateUIForUser() {
  const adminBtn = document.getElementById('adminPanelBtn');
  const shareBtn = document.getElementById('shareNewsBtn');
  const usernameSpan = document.getElementById('usernameDisplay');
  const dropdownUser = document.getElementById('dropdownUser');
  const dropdownRole = document.getElementById('dropdownRole');
  if (currentUser) {
    usernameSpan.textContent = currentUser.username;
    dropdownUser.textContent = currentUser.username;
    dropdownRole.textContent = currentUser.role === 'admin' ? 'Administrador' : (currentUser.role === 'editor' ? 'Editor' : 'Lector');
    if (currentUser.role === 'admin' || currentUser.role === 'editor') {
      adminBtn.style.display = 'flex';
    } else {
      adminBtn.style.display = 'none';
    }
    shareBtn.style.display = 'flex';
  } else {
    usernameSpan.textContent = 'Cuenta';
    dropdownUser.textContent = 'Invitado';
    dropdownRole.textContent = '';
    adminBtn.style.display = 'none';
    shareBtn.style.display = 'flex';
  }
}
function canEditNews(noticia) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'editor') return noticia.autorId === currentUser.id;
  return false;
}
function canDeleteNews(noticia) {
  if (!currentUser) return false;
  if (currentUser.role === 'admin') return true;
  if (currentUser.role === 'editor') return noticia.autorId === currentUser.id;
  return false;
}
function canApprovePending() {
  return currentUser && currentUser.role === 'admin';
}
function canManageCategories() {
  return currentUser && currentUser.role === 'admin';
}

// ======================== DATOS DEL SITIO ========================
function loadData() {
  const storedCat = localStorage.getItem('moda_categorias');
  if (storedCat) {
    categorias = JSON.parse(storedCat);
  } else {
    categorias = [
      { id: 1, nombre: "Tendencias", slug: "tendencias" },
      { id: 2, nombre: "Pasarela", slug: "pasarela" },
      { id: 3, nombre: "Streetwear", slug: "streetwear" },
      { id: 4, nombre: "Lujo", slug: "lujo" },
      { id: 5, nombre: "Argentina", slug: "argentina" }
    ];
    saveCategorias();
  }
  const storedNews = localStorage.getItem('moda_noticias_v2');
  if (storedNews) {
    noticias = JSON.parse(storedNews);
  } else {
    const now = new Date().toISOString().slice(0,16);
    noticias = [
      { id: 1, titulo: "Buenos Aires Fashion Week: lo mejor del lujo local", subtitulo: "Pasarelas icónicas y diseño sustentable", contenido: "<p>La semana de la moda porteña brilló con colecciones de autor.</p><p><strong>Diseñadores argentinos</strong> presentaron propuestas audaces que combinan tradición y vanguardia.</p>", categorias: ["pasarela"], tags: ["fashion week", "lujo", "diseño"], autor: "Redacción", autorId: 1, fecha: "2025-02-10", publish_date: now, imagen: "https://picsum.photos/id/20/800/500", vistas: 245, status: "published" },
      { id: 2, titulo: "Streetwear argentino: la fusión que conquista el mundo", subtitulo: "Marcas emergentes y estética urbana", contenido: "<p>El estilo callejero argentino se impone con prendas oversize y grafismo local.</p><p><em>Jóvenes diseñadores</em> llevan la identidad argentina a las calles.</p>", categorias: ["streetwear"], tags: ["streetwear", "urbano"], autor: "Lucía Mendez", autorId: 1, fecha: "2025-02-12", publish_date: now, imagen: "https://picsum.photos/id/26/800/500", vistas: 189, status: "published" },
      { id: 3, titulo: "Tendencias otoño/invierno 2025", subtitulo: "Tonos tierra y texturas", contenido: "<p>Las principales influencers muestran cómo llevar el layering con estilo.</p><p>El barrio de Palermo se convierte en <strong>pasarela urbana</strong>.</p>", categorias: ["tendencias"], tags: ["tendencias", "moda otoño"], autor: "Valentina Rossi", autorId: 1, fecha: "2025-02-14", publish_date: now, imagen: "https://picsum.photos/id/30/800/500", vistas: 302, status: "published" }
    ];
    saveNoticias();
  }
  noticias.forEach(n => { 
    if (!n.categorias) n.categorias = [];
    if (!n.tags) n.tags = [];
    if (!n.publish_date) n.publish_date = new Date().toISOString().slice(0,16);
    if (!n.status) n.status = "published";
    if (!n.vistas) n.vistas = 0;
    if (!n.autorId) n.autorId = 1;
  });
  saveNoticias();
}
function saveCategorias() { localStorage.setItem('moda_categorias', JSON.stringify(categorias)); }
function saveNoticias() { localStorage.setItem('moda_noticias_v2', JSON.stringify(noticias)); }

function getCategoriaNombre(slug) { const cat = categorias.find(c => c.slug === slug); return cat ? cat.nombre : slug; }
function getNoticiasPublicadas() { 
  const now = new Date();
  return noticias.filter(n => n.status === "published" && new Date(n.publish_date) <= now);
}
function getNoticiasPendientes() { return noticias.filter(n => n.status === "pending"); }
function getNoticiaById(id) { return noticias.find(n => n.id == id); }
function incrementarVistas(id) { const idx = noticias.findIndex(n => n.id == id); if(idx !== -1) { noticias[idx].vistas++; saveNoticias(); } }
function crearNoticia(data, status = "published") { 
  const newId = Date.now(); 
  data.id = newId; 
  data.vistas = data.vistas || 0; 
  data.fecha = data.fecha || new Date().toISOString().split('T')[0];
  if (!data.publish_date) data.publish_date = new Date().toISOString().slice(0,16);
  data.status = status; 
  noticias.push(data); 
  saveNoticias(); 
  return newId; 
}
function actualizarNoticia(id, datos) { 
  const idx = noticias.findIndex(n => n.id == id); 
  if(idx !== -1) { 
    noticias[idx] = { ...noticias[idx], ...datos, id: parseInt(id) }; 
    saveNoticias(); 
  } 
}
function eliminarNoticia(id) { noticias = noticias.filter(n => n.id != id); saveNoticias(); }
function aprobarNoticia(id) { 
  const idx = noticias.findIndex(n => n.id == id); 
  if(idx !== -1) { 
    noticias[idx].status = "published"; 
    if (!noticias[idx].publish_date) noticias[idx].publish_date = new Date().toISOString().slice(0,16);
    saveNoticias(); 
  } 
}

function crearUsuario(username, password, email, role) {
  if (usuarios.find(u => u.username === username)) return false;
  const newId = Date.now();
  usuarios.push({ id: newId, username, password: hashPassword(password), email, role, createdAt: new Date().toISOString() });
  saveUsers();
  return true;
}
function actualizarUsuario(id, data) {
  const idx = usuarios.findIndex(u => u.id == id);
  if (idx !== -1) {
    usuarios[idx] = { ...usuarios[idx], ...data };
    if (data.password) usuarios[idx].password = hashPassword(data.password);
    saveUsers();
    if (currentUser && currentUser.id == id) {
      currentUser = { ...usuarios[idx], password: undefined };
      localStorage.setItem('moda_currentUser', JSON.stringify(currentUser));
    }
  }
}
function eliminarUsuario(id) {
  if (id === 1) return;
  usuarios = usuarios.filter(u => u.id != id);
  saveUsers();
  if (currentUser && currentUser.id == id) logout();
}

// ======================== RENDER PRINCIPAL ========================
function render() {
  const hash = window.location.hash.slice(1);
  if (hash.startsWith('article/')) renderArticle(hash.split('/')[1]);
  else if (hash.startsWith('categoria/')) renderCategory(hash.split('/')[1]);
  else if (hash.startsWith('tag/')) renderTag(hash.split('/')[1]);
  else if (hash === 'admin') { 
    if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) {
      alert("No tienes permisos para acceder al panel.");
      window.location.hash = 'home';
      return;
    }
    renderAdminPanel(); 
  }
  else renderHome();
}

function renderHome() {
  const publicadas = getNoticiasPublicadas();
  const sorted = [...publicadas].sort((a,b)=> new Date(b.publish_date) - new Date(a.publish_date));
  const destacada = sorted[0];
  const ultimas = sorted.slice(1, 5);
  const populares = [...publicadas].sort((a,b)=> (b.vistas||0)-(a.vistas||0)).slice(0,3);
  const tagCounts = new Map();
  publicadas.forEach(noti => { noti.tags.forEach(tag => tagCounts.set(tag, (tagCounts.get(tag)||0)+1)); });
  const topTags = Array.from(tagCounts.entries()).sort((a,b)=>b[1]-a[1]).slice(0,5);
  let html = `<div class="hero-grid">
    ${destacada ? `<div class="hero-card"><img src="${destacada.imagen}"><div class="hero-content"><span class="hero-category">⭐ ${destacada.categorias.map(c=>getCategoriaNombre(c)).join(', ')}</span><h1 class="hero-title">${destacada.titulo}</h1><p>${destacada.subtitulo}</p><div class="meta">${destacada.fecha} · ${destacada.autor}</div><a href="#article/${destacada.id}" style="color:#d4af37; font-weight:600;">Leer más →</a></div></div>` : '<div>Cargando...</div>'}
    <div class="sidebar"><h3><i class="fas fa-fire"></i> Más populares</h3>${populares.map(p=>`<div class="popular-item"><img src="${p.imagen}" class="popular-img"><div><a href="#article/${p.id}" style="text-decoration:none; color:black;">${p.titulo.substring(0,50)}</a><br><span>👁️ ${p.vistas} vistas</span></div></div>`).join('')}
    ${topTags.length ? `<div style="margin-top:24px;"><h4>🏷️ Etiquetas populares</h4><div style="display:flex; flex-wrap:wrap; gap:6px;">${topTags.map(([tag])=>`<a href="#tag/${encodeURIComponent(tag)}" style="background:#e9ecef; padding:4px 10px; border-radius:30px; font-size:0.7rem; text-decoration:none; color:#495057;">${tag}</a>`).join('')}</div></div>` : ''}
    <div class="newsletter" style="margin-top:24px;"><h4>📧 Newsletter</h4><input id="newsEmail" placeholder="tu@email.com"><button class="btn-gold" id="subNewsBtn">Suscribirme</button></div></div>
  </div><h2>📰 Últimas noticias</h2><div class="latest-grid">${ultimas.map(n=>`<div class="article-card"><img src="${n.imagen}"><div class="card-content"><div>${n.categorias.map(c=>`<span class="category-badge">${getCategoriaNombre(c)}</span>`).join('')}</div><h3 class="card-title">${n.titulo}</h3><div class="meta">${n.fecha} · ${n.autor}</div><p>${n.subtitulo.substring(0,80)}...</p><a href="#article/${n.id}" style="color:#d4af37;">Leer más →</a></div></div>`).join('')}</div>`;
  document.getElementById('app').innerHTML = html;
  document.getElementById('subNewsBtn')?.addEventListener('click',()=>alert('✅ ¡Gracias!'));
}

function renderArticle(id) {
  const noticia = getNoticiaById(parseInt(id));
  if(!noticia || noticia.status !== "published" || new Date(noticia.publish_date) > new Date()) { 
    document.getElementById('app').innerHTML = '<p>Artículo no disponible</p>'; 
    return; 
  }
  incrementarVistas(noticia.id);
  const relacionadas = getNoticiasPublicadas().filter(n=> n.categorias.some(c=> noticia.categorias.includes(c)) && n.id!=noticia.id).slice(0,3);
  const shareUrl = encodeURIComponent(window.location.href);
  const html = `<article style="max-width:900px; margin:0 auto;"><h1 style="font-size:2.5rem;">${noticia.titulo}</h1><p style="font-size:1.2rem;">${noticia.subtitulo}</p><div class="meta">${noticia.autor} · ${noticia.fecha} · 👁️ ${noticia.vistas} vistas</div>
  <div>${noticia.categorias.map(c=>`<span class="category-badge">${getCategoriaNombre(c)}</span>`).join('')}</div>
  <div>${noticia.tags.map(t=>`<a href="#tag/${encodeURIComponent(t)}" style="text-decoration:none;"><span class="tag-badge">#${t}</span></a>`).join('')}</div>
  <img src="${noticia.imagen}" style="width:100%; border-radius:24px; margin:24px 0;">
  <div style="font-size:1.1rem; line-height:1.7;">${noticia.contenido}</div>
  <div style="display:flex; gap:16px; margin:32px 0;"><a href="https://twitter.com/intent/tweet?url=${shareUrl}&text=${noticia.titulo}" target="_blank" style="background:#000; color:white; padding:8px 16px; border-radius:40px;">Twitter</a><a href="https://www.facebook.com/sharer/sharer.php?u=${shareUrl}" target="_blank" style="background:#1877f2; color:white; padding:8px 16px; border-radius:40px;">Facebook</a><a href="https://wa.me/?text=${noticia.titulo} ${shareUrl}" target="_blank" style="background:#25d366; color:white; padding:8px 16px; border-radius:40px;">WhatsApp</a></div><hr><h3>✨ Relacionadas</h3><div class="latest-grid">${relacionadas.map(r=>`<div class="article-card"><img src="${r.imagen}"><div class="card-content"><a href="#article/${r.id}" style="font-weight:bold;">${r.titulo}</a></div></div>`).join('')}</div></article>`;
  document.getElementById('app').innerHTML = html;
  document.title = `${noticia.titulo} | Moda Argentina`;
}

function renderCategory(slug) {
  const publicadas = getNoticiasPublicadas().filter(n => n.categorias.includes(slug));
  const catNombre = getCategoriaNombre(slug);
  const html = `<h2>${catNombre.toUpperCase()}</h2><div class="latest-grid">${publicadas.map(n=>`<div class="article-card"><img src="${n.imagen}"><div class="card-content"><div>${n.categorias.map(c=>`<span class="category-badge">${getCategoriaNombre(c)}</span>`).join('')}</div><h3>${n.titulo}</h3><p>${n.subtitulo.substring(0,70)}</p><a href="#article/${n.id}" style="color:#d4af37;">Leer más →</a></div></div>`).join('')}</div>`;
  document.getElementById('app').innerHTML = html;
}

function renderTag(tag) {
  const publicadas = getNoticiasPublicadas().filter(n => n.tags.includes(tag));
  const html = `<h2>🏷️ Etiqueta: ${tag}</h2><div class="latest-grid">${publicadas.map(n=>`<div class="article-card"><img src="${n.imagen}"><div class="card-content"><div>${n.categorias.map(c=>`<span class="category-badge">${getCategoriaNombre(c)}</span>`).join('')}</div><h3>${n.titulo}</h3><p>${n.subtitulo.substring(0,70)}</p><a href="#article/${n.id}" style="color:#d4af37;">Leer más →</a></div></div>`).join('')}</div>`;
  document.getElementById('app').innerHTML = html;
}

function renderSearch(query) {
  const resultados = getNoticiasPublicadas().filter(n => 
    n.titulo.toLowerCase().includes(query.toLowerCase()) || 
    n.contenido.toLowerCase().includes(query.toLowerCase()) ||
    n.tags.some(t=>t.toLowerCase().includes(query.toLowerCase()))
  );
  const html = `<h2>🔍 Resultados: "${query}" (${resultados.length})</h2><div class="latest-grid">${resultados.map(n=>`<div class="article-card"><img src="${n.imagen}"><div class="card-content"><h3>${n.titulo}</h3><p>${n.subtitulo}</p><a href="#article/${n.id}">Leer</a></div></div>`).join('')}</div>`;
  document.getElementById('app').innerHTML = html;
}

// ======================== PANEL ADMIN ========================
function renderAdminPanel() {
  if(!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'editor')) return;
  const publicadas = getNoticiasPublicadas();
  const pendientes = getNoticiasPendientes();
  const totalVistas = publicadas.reduce((s,n)=>s+(n.vistas||0),0);
  const showCategoriesTab = canManageCategories();
  const showUsersTab = currentUser.role === 'admin';
  
  const tabsHtml = `
    <button class="tab-btn ${currentActiveTab === 'published' ? 'active' : ''}" data-tab="published">📰 Publicadas (${publicadas.length})</button>
    <button class="tab-btn ${currentActiveTab === 'pending' ? 'active' : ''}" data-tab="pending">⏳ Pendientes (${pendientes.length})</button>
    ${showCategoriesTab ? `<button class="tab-btn ${currentActiveTab === 'categories' ? 'active' : ''}" data-tab="categories">🏷️ Categorías (${categorias.length})</button>` : ''}
    ${showUsersTab ? `<button class="tab-btn ${currentActiveTab === 'users' ? 'active' : ''}" data-tab="users">👥 Usuarios (${usuarios.length})</button>` : ''}
  `;
  
  const html = `
    <div class="admin-panel">
      <div class="admin-tabs">${tabsHtml}</div>
      <div id="publishedPane" class="tab-pane ${currentActiveTab === 'published' ? 'active' : ''}">
        <div class="admin-header"><h3>Gestionar noticias publicadas</h3><div class="admin-stats">Total vistas: ${totalVistas}</div></div>
        <div id="successMsg" class="success-msg"></div>
        <form id="adminForm"><input type="hidden" id="editId"><div class="form-group"><label>Título</label><input id="titulo" required></div><div class="form-group"><label>Subtítulo</label><input id="subtitulo" required></div>
        <div class="form-group"><label>Categorías (puede seleccionar varias)</label><div id="categoriasCheckboxes" class="categories-checkbox-group"></div></div>
        <div class="form-group"><label>Etiquetas (separadas por coma)</label><input id="tagsInput" placeholder="ej: moda, tendencias"></div>
        <div class="form-group"><label>Contenido</label>
          <div class="rich-editor-toolbar" id="editorToolbar">
            <button type="button" data-cmd="bold"><i class="fas fa-bold"></i></button>
            <button type="button" data-cmd="italic"><i class="fas fa-italic"></i></button>
            <button type="button" data-cmd="underline"><i class="fas fa-underline"></i></button>
            <button type="button" data-cmd="insertUnorderedList"><i class="fas fa-list-ul"></i></button>
            <button type="button" data-cmd="insertOrderedList"><i class="fas fa-list-ol"></i></button>
            <button type="button" data-cmd="createLink"><i class="fas fa-link"></i></button>
            <button type="button" data-cmd="unlink"><i class="fas fa-unlink"></i></button>
            <select data-cmd="formatBlock" style="padding:4px; border-radius:8px;">
              <option value="">Normal</option>
              <option value="h2">Título 2</option>
              <option value="h3">Título 3</option>
            </select>
          </div>
          <div id="contenidoEditor" class="rich-editor" contenteditable="true"></div>
        </div>
        <div class="form-group"><label>Autor</label><input id="autor" value="${currentUser.username}"></div>
        <div class="form-group"><label>Fecha de publicación</label><input type="datetime-local" id="publish_date" step="60"></div>
        <div class="form-group"><label>Imagen destacada</label><input type="file" id="imagenFile" accept="image/*"><div id="imgPreview"></div></div>
        <button type="submit" class="btn-gold">Guardar noticia</button><button type="button" id="cancelEditBtn" style="background:#ccc; border:none; padding:10px 20px; border-radius:40px;">Cancelar</button></form>
        <div id="adminNewsList"></div>
      </div>
      <div id="pendingPane" class="tab-pane ${currentActiveTab === 'pending' ? 'active' : ''}">
        <h3>Noticias pendientes de verificación</h3>
        <div id="pendingNewsList"></div>
      </div>
      ${showCategoriesTab ? `
      <div id="categoriesPane" class="tab-pane ${currentActiveTab === 'categories' ? 'active' : ''}">
        <h3>Gestionar categorías</h3>
        <form id="catForm"><div class="form-group"><label>Nombre categoría</label><input id="catNombre" required></div><div class="form-group"><label>Slug (identificador único)</label><input id="catSlug" required></div><button type="submit" class="btn-gold">Agregar categoría</button></form>
        <div id="categoriesList" style="margin-top:24px;"></div>
      </div>
      ` : ''}
      ${showUsersTab ? `
      <div id="usersPane" class="tab-pane ${currentActiveTab === 'users' ? 'active' : ''}">
        <h3>Gestionar usuarios</h3>
        <form id="userForm"><div class="form-group"><label>Usuario</label><input id="newUsername" required></div><div class="form-group"><label>Email</label><input type="email" id="newEmail" required></div><div class="form-group"><label>Contraseña</label><input type="password" id="newPassword" required></div><div class="form-group"><label>Rol</label><select id="newRole"><option value="reader">Lector</option><option value="editor">Editor</option><option value="admin">Administrador</option></select></div><button type="submit" class="btn-gold">Agregar usuario</button></form>
        <div id="usersList" style="margin-top:24px;"></div>
      </div>
      ` : ''}
    </div>
  `;
  document.getElementById('app').innerHTML = html;
  
  const checkboxesDiv = document.getElementById('categoriasCheckboxes');
  if(checkboxesDiv) {
    checkboxesDiv.innerHTML = categorias.map(cat => `
      <label><input type="checkbox" value="${cat.slug}"> ${cat.nombre}</label>
    `).join('');
  }
  
  initRichEditor();
  
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentActiveTab = btn.dataset.tab;
      renderAdminPanel();
    });
  });
  
  cargarListadoPublicadas();
  cargarListadoPendientes();
  if (showCategoriesTab) cargarListadoCategorias();
  if (showUsersTab) cargarListadoUsuarios();
  
  document.getElementById('adminForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    let imagenBase64 = null;
    const file = document.getElementById('imagenFile').files[0];
    if(file) imagenBase64 = await leerImagen(file);
    const contenidoHtml = document.getElementById('contenidoEditor').innerHTML;
    let publishDate = document.getElementById('publish_date').value;
    if (!publishDate) publishDate = new Date().toISOString().slice(0,16);
    const selectedCats = Array.from(document.querySelectorAll('#categoriasCheckboxes input:checked')).map(cb => cb.value);
    const tagsStr = document.getElementById('tagsInput').value;
    const tags = tagsStr.split(',').map(t => t.trim()).filter(t => t);
    const data = {
      titulo: document.getElementById('titulo').value,
      subtitulo: document.getElementById('subtitulo').value,
      categorias: selectedCats,
      tags: tags,
      contenido: contenidoHtml,
      autor: document.getElementById('autor').value,
      autorId: currentUser.id,
      fecha: new Date().toISOString().split('T')[0],
      publish_date: publishDate,
    };
    if(imagenBase64) data.imagen = imagenBase64;
    if(id) {
      const original = getNoticiaById(parseInt(id));
      if(!imagenBase64) data.imagen = original.imagen;
      if (!canEditNews(original)) { alert("No tienes permisos para editar esta noticia."); return; }
      actualizarNoticia(id, data);
      showSuccess("Noticia actualizada");
    } else {
      if(!imagenBase64) { alert("Imagen obligatoria"); return; }
      data.imagen = imagenBase64;
      crearNoticia(data, "published");
      showSuccess("Noticia creada");
    }
    resetAdminForm();
    cargarListadoPublicadas();
  });
  document.getElementById('cancelEditBtn')?.addEventListener('click', resetAdminForm);
  if (showCategoriesTab) {
    document.getElementById('catForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = document.getElementById('catNombre').value.trim();
      let slug = document.getElementById('catSlug').value.trim();
      if(!nombre || !slug) return;
      slug = slug.toLowerCase().replace(/\s+/g, '-');
      if(categorias.some(c=>c.slug===slug)) { alert("Slug ya existe"); return; }
      agregarCategoria(nombre, slug);
      document.getElementById('catForm').reset();
      renderAdminPanel();
      renderDynamicCategories();
    });
  }
  if (showUsersTab) {
    document.getElementById('userForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('newUsername').value.trim();
      const email = document.getElementById('newEmail').value.trim();
      const password = document.getElementById('newPassword').value;
      const role = document.getElementById('newRole').value;
      if (!username || !email || !password) return;
      if (crearUsuario(username, password, email, role)) {
        showSuccess("Usuario creado");
        document.getElementById('userForm').reset();
        cargarListadoUsuarios();
      } else {
        alert("El usuario ya existe");
      }
    });
  }
}

function initRichEditor() {
  const editor = document.getElementById('contenidoEditor');
  if(!editor) return;
  const toolbar = document.getElementById('editorToolbar');
  if(!toolbar) return;
  toolbar.querySelectorAll('[data-cmd]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const cmd = btn.getAttribute('data-cmd');
      if(cmd === 'createLink') {
        const url = prompt("Ingrese la URL del enlace:", "https://");
        if(url) document.execCommand(cmd, false, url);
      } else if(cmd === 'formatBlock') {
        const value = btn.value;
        if(value) document.execCommand('formatBlock', false, value);
      } else {
        document.execCommand(cmd, false, null);
      }
      editor.focus();
    });
  });
}

function cargarListadoPublicadas() {
  const listDiv = document.getElementById('adminNewsList');
  if(!listDiv) return;
  let publicadas = noticias.filter(n => n.status === "published").sort((a,b)=> new Date(b.publish_date) - new Date(a.publish_date));
  if (currentUser.role === 'editor') {
    publicadas = publicadas.filter(n => n.autorId === currentUser.id);
  }
  if(publicadas.length === 0) { listDiv.innerHTML = '<p>📭 No hay noticias publicadas.</p>'; return; }
  listDiv.innerHTML = publicadas.map(noti => {
    const isScheduled = new Date(noti.publish_date) > new Date();
    return `
    <div class="admin-article-row">
      <div><strong>${noti.titulo}</strong><br><small>${noti.fecha} | ${noti.categorias.map(c=>getCategoriaNombre(c)).join(', ')} | 👁️ ${noti.vistas}${isScheduled ? ` | <span class="scheduled-badge">📅 Programada: ${new Date(noti.publish_date).toLocaleString()}</span>` : ''}</small></div>
      <div><button class="edit-btn" data-id="${noti.id}">Editar</button><button class="delete-btn" data-id="${noti.id}">Eliminar</button></div>
    </div>
  `}).join('');
  document.querySelectorAll('.edit-btn').forEach(btn => btn.addEventListener('click', () => editarNoticia(btn.dataset.id)));
  document.querySelectorAll('.delete-btn').forEach(btn => btn.addEventListener('click', () => { 
    if(confirm("Eliminar esta noticia?")) { 
      const noti = getNoticiaById(btn.dataset.id);
      if (canDeleteNews(noti)) {
        eliminarNoticia(btn.dataset.id); 
        cargarListadoPublicadas(); 
        cargarListadoPendientes(); 
        showSuccess("Noticia eliminada");
      } else {
        alert("No tienes permisos para eliminar esta noticia.");
      }
    } 
  }));
}

function cargarListadoPendientes() {
  const listDiv = document.getElementById('pendingNewsList');
  if(!listDiv) return;
  const pendientes = getNoticiasPendientes();
  if(pendientes.length === 0) { listDiv.innerHTML = '<p>✨ No hay noticias pendientes.</p>'; return; }
  listDiv.innerHTML = pendientes.map(noti => `
    <div class="admin-article-row">
      <div><strong>${noti.titulo}</strong><br><small>${noti.fecha || 'propuesta reciente'} | ${noti.categorias.map(c=>getCategoriaNombre(c)).join(', ')} | Autor: ${noti.autor}</small></div>
      <div>${canApprovePending() ? `<button class="approve-btn" data-id="${noti.id}">Aprobar</button><button class="reject-btn" data-id="${noti.id}">Rechazar</button>` : '<span class="scheduled-badge">Pendiente de revisión</span>'}</div>
    </div>
  `).join('');
  if (canApprovePending()) {
    document.querySelectorAll('.approve-btn').forEach(btn => btn.addEventListener('click', () => { 
      aprobarNoticia(btn.dataset.id); 
      cargarListadoPublicadas(); 
      cargarListadoPendientes(); 
      showSuccess("Noticia aprobada y publicada"); 
    }));
    document.querySelectorAll('.reject-btn').forEach(btn => btn.addEventListener('click', () => { 
      if(confirm("Rechazar y eliminar esta noticia?")) { 
        eliminarNoticia(btn.dataset.id); 
        cargarListadoPendientes(); 
        showSuccess("Noticia rechazada"); 
      } 
    }));
  }
}

function cargarListadoCategorias() {
  const listDiv = document.getElementById('categoriesList');
  if(!listDiv) return;
  listDiv.innerHTML = categorias.map(cat => `
    <div class="admin-article-row">
      <div><strong>${cat.nombre}</strong> (${cat.slug})</div>
      <div><button class="edit-cat-btn" data-id="${cat.id}" data-nombre="${cat.nombre}" data-slug="${cat.slug}">Editar</button><button class="delete-cat-btn" data-id="${cat.id}">Eliminar</button></div>
    </div>
  `).join('');
  document.querySelectorAll('.edit-cat-btn').forEach(btn => btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    const nombre = prompt("Nuevo nombre", btn.dataset.nombre);
    const slug = prompt("Nuevo slug (sin espacios)", btn.dataset.slug);
    if(nombre && slug) {
      editarCategoria(parseInt(id), nombre, slug.toLowerCase().replace(/\s+/g,'-'));
      renderAdminPanel();
      renderDynamicCategories();
    }
  }));
  document.querySelectorAll('.delete-cat-btn').forEach(btn => btn.addEventListener('click', () => { 
    if(confirm("¿Eliminar categoría? Las noticias con esta categoría quedarán sin categoría.")) {
      eliminarCategoria(parseInt(btn.dataset.id)); 
      renderAdminPanel(); 
      renderDynamicCategories();
    }
  }));
}

function cargarListadoUsuarios() {
  const listDiv = document.getElementById('usersList');
  if(!listDiv) return;
  listDiv.innerHTML = usuarios.map(user => `
    <div class="user-row">
      <div><strong>${user.username}</strong> (${user.role})<br><small>${user.email}</small></div>
      <div>
        ${user.id !== 1 ? `<button class="promote-btn" data-id="${user.id}" data-role="${user.role}">Cambiar rol</button><button class="delete-btn" data-id="${user.id}">Eliminar</button>` : '<span>Admin principal</span>'}
      </div>
    </div>
  `).join('');
  document.querySelectorAll('.promote-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = parseInt(btn.dataset.id);
      const currentRole = btn.dataset.role;
      let newRole = '';
      if (currentRole === 'reader') newRole = 'editor';
      else if (currentRole === 'editor') newRole = 'admin';
      else newRole = 'reader';
      if (confirm(`Cambiar rol de ${usuarios.find(u=>u.id===userId).username} a ${newRole}?`)) {
        actualizarUsuario(userId, { role: newRole });
        cargarListadoUsuarios();
        showSuccess("Rol actualizado");
      }
    });
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const userId = parseInt(btn.dataset.id);
      if (userId === 1) { alert("No se puede eliminar al administrador principal"); return; }
      if (confirm("¿Eliminar usuario?")) {
        eliminarUsuario(userId);
        cargarListadoUsuarios();
        showSuccess("Usuario eliminado");
      }
    });
  });
}

async function editarNoticia(id) {
  const noti = getNoticiaById(parseInt(id));
  if(!noti) return;
  if (!canEditNews(noti)) { alert("No tienes permisos para editar esta noticia."); return; }
  document.getElementById('editId').value = id;
  document.getElementById('titulo').value = noti.titulo;
  document.getElementById('subtitulo').value = noti.subtitulo;
  const checkboxes = document.querySelectorAll('#categoriasCheckboxes input');
  checkboxes.forEach(cb => {
    cb.checked = noti.categorias.includes(cb.value);
  });
  document.getElementById('tagsInput').value = noti.tags.join(', ');
  const editor = document.getElementById('contenidoEditor');
  if(editor) editor.innerHTML = noti.contenido || '';
  document.getElementById('autor').value = noti.autor;
  const publishDateInput = document.getElementById('publish_date');
  if(publishDateInput && noti.publish_date) publishDateInput.value = noti.publish_date.slice(0,16);
  const preview = document.getElementById('imgPreview');
  if(preview) preview.innerHTML = `<img src="${noti.imagen}" style="max-width:100px; border-radius:12px;"><p>Imagen actual</p>`;
}
function resetAdminForm() {
  document.getElementById('editId').value = '';
  document.getElementById('adminForm')?.reset();
  const editor = document.getElementById('contenidoEditor');
  if(editor) editor.innerHTML = '';
  const preview = document.getElementById('imgPreview');
  if(preview) preview.innerHTML = '';
  const checkboxes = document.querySelectorAll('#categoriasCheckboxes input');
  checkboxes.forEach(cb => cb.checked = false);
}
function showSuccess(msg) { const d = document.getElementById('successMsg'); if(d) { d.textContent = msg; d.style.display = 'block'; setTimeout(()=>d.style.display='none',3000); } }
function leerImagen(file) { return new Promise((resolve) => { const r = new FileReader(); r.onload = e => resolve(e.target.result); r.readAsDataURL(file); }); }

function agregarCategoria(nombre, slug) { const newId = Date.now(); categorias.push({ id: newId, nombre, slug }); saveCategorias(); renderDynamicCategories(); }
function editarCategoria(id, nuevoNombre, nuevoSlug) { const idx = categorias.findIndex(c => c.id == id); if(idx !== -1) { categorias[idx] = { ...categorias[idx], nombre: nuevoNombre, slug: nuevoSlug }; saveCategorias(); renderDynamicCategories(); } }
function eliminarCategoria(id) { if(confirm("¿Eliminar categoría? Las noticias con esta categoría quedarán sin categoría.")) { categorias = categorias.filter(c => c.id != id); saveCategorias(); renderDynamicCategories(); } }

function renderDynamicCategories() {
  const bar = document.getElementById('dynamicCategoriesBar');
  if (!bar) return;
  bar.innerHTML = `<a href="#" data-nav="home">INICIO</a>` +
    categorias.map(cat => `<a href="#" data-nav="categoria/${cat.slug}">${cat.nombre.toUpperCase()}</a>`).join('');
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.removeEventListener('click', handleNavClick);
    link.addEventListener('click', handleNavClick);
  });
}
function handleNavClick(e) {
  e.preventDefault();
  const navPath = e.currentTarget.getAttribute('data-nav');
  if (navPath === 'home') window.location.hash = '';
  else if (navPath.startsWith('categoria/')) window.location.hash = navPath;
  else window.location.hash = navPath;
}

function initSubmitModal() {
  const modal = document.getElementById('submitNewsModal');
  document.getElementById('shareNewsBtn').addEventListener('click', () => {
    if (!currentUser) {
      alert("Debes iniciar sesión para enviar noticias.");
      showAuthModal();
      return;
    }
    const select = document.getElementById('submitCategoria');
    if(select) select.innerHTML = categorias.map(c => `<option value="${c.slug}">${c.nombre}</option>`).join('');
    modal.style.display = 'flex';
  });
  document.getElementById('closeSubmitModal').addEventListener('click', () => modal.style.display = 'none');
  document.getElementById('submitNewsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentUser) { alert("Debes iniciar sesión."); return; }
    let imagen = "https://picsum.photos/id/20/800/500";
    const file = document.getElementById('submitImagenFile').files[0];
    if(file) imagen = await leerImagen(file);
    const contenidoPlano = document.getElementById('submitContenido').value.replace(/\n/g, '<br>');
    const tagsStr = document.getElementById('submitTags').value;
    const tags = tagsStr.split(',').map(t=>t.trim()).filter(t=>t);
    const nueva = {
      titulo: document.getElementById('submitTitulo').value,
      subtitulo: document.getElementById('submitSubtitulo').value,
      categorias: [document.getElementById('submitCategoria').value],
      tags: tags,
      contenido: `<p>${contenidoPlano}</p>`,
      autor: document.getElementById('submitAutor').value,
      autorId: currentUser.id,
      imagen: imagen,
      fecha: new Date().toISOString().split('T')[0],
      publish_date: new Date().toISOString().slice(0,16),
      status: "pending",
      vistas: 0
    };
    crearNoticia(nueva, "pending");
    alert("✅ Noticia enviada. Será revisada por el equipo.");
    modal.style.display = 'none';
    document.getElementById('submitNewsForm').reset();
  });
}

function showAuthModal() { document.getElementById('authModal').style.display = 'flex'; }
function hideAuthModal() { document.getElementById('authModal').style.display = 'none'; }
function initAuth() {
  const authModal = document.getElementById('authModal');
  const authForm = document.getElementById('authForm');
  const toggleBtn = document.getElementById('toggleAuthBtn');
  const authTitle = document.getElementById('authTitle');
  const registerFields = document.getElementById('registerFields');
  const authSubmit = document.getElementById('authSubmitBtn');
  let isLogin = true;
  toggleBtn.addEventListener('click', () => {
    isLogin = !isLogin;
    if (isLogin) {
      authTitle.textContent = "Iniciar sesión";
      registerFields.style.display = 'none';
      authSubmit.textContent = "Ingresar";
      toggleBtn.textContent = "¿No tenés cuenta? Registrate";
    } else {
      authTitle.textContent = "Registrarse";
      registerFields.style.display = 'block';
      authSubmit.textContent = "Registrarse";
      toggleBtn.textContent = "¿Ya tenés cuenta? Iniciar sesión";
    }
  });
  authForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    if (isLogin) {
      if (login(username, password)) {
        hideAuthModal();
        updateUIForUser();
        window.location.hash = 'home';
        render();
      } else {
        alert("Usuario o contraseña incorrectos");
      }
    } else {
      const email = document.getElementById('authEmail').value.trim();
      const confirm = document.getElementById('authConfirmPassword').value;
      if (password !== confirm) { alert("Las contraseñas no coinciden"); return; }
      if (register(username, password, email)) {
        alert("Registro exitoso. Ahora inicia sesión.");
        isLogin = true;
        toggleBtn.click();
      } else {
        alert("El usuario ya existe");
      }
    }
  });
  document.getElementById('closeAuthModal').addEventListener('click', hideAuthModal);
}

function initUserMenu() {
  const userBtn = document.getElementById('userMenuBtn');
  const dropdown = document.getElementById('userDropdown');
  userBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  document.getElementById('logoutBtn').addEventListener('click', () => {
    logout();
    updateUIForUser();
    window.location.hash = 'home';
    render();
  });
}

function initEventListeners() {
  document.getElementById('searchBtn').addEventListener('click', () => { const q = document.getElementById('searchInput').value.trim(); if(q) renderSearch(q); else renderHome(); });
  document.getElementById('adminPanelBtn').addEventListener('click', () => { if (currentUser && (currentUser.role === 'admin' || currentUser.role === 'editor')) window.location.hash='admin'; else alert("No tienes permisos"); });
  window.addEventListener('hashchange', render);
  renderDynamicCategories();
  initUserMenu();
  initAuth();
  initSubmitModal();
}

// Inicialización
loadUsers();
loadData();
checkStoredSession();
initEventListeners();
if(!window.location.hash || window.location.hash === '') window.location.hash = 'home';
render();