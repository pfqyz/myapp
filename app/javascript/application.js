import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener("turbo:load", () => {
  
  // ==========================================
  // 1. ПАНЕЛЬ
  // ==========================================
  const drawer = document.getElementById('pagesDrawer');
  const drawerTab = document.getElementById('drawerTab');
  
  if (drawer && drawerTab) {
    const tabIcon = drawerTab.querySelector('.material-symbols-outlined');
    drawerTab.addEventListener('click', (e) => {
      e.preventDefault();
      drawer.classList.toggle('open');
      if (tabIcon) {
        tabIcon.textContent = drawer.classList.contains('open') ? 'chevron_left' : 'chevron_right';
      }
    });
  }

  // ==========================================
  // 2. ХОЛСТ И СТРАНИЦЫ
  // ==========================================
  const container = document.getElementById('canvas-container');
  if (!container || typeof Konva === 'undefined') return;

  // Читаем JSON из скрипта
  const initialDataElement = document.getElementById('note-initial-data');
  let initialData = {};
  try {
    if (initialDataElement) {
      initialData = JSON.parse(initialDataElement.textContent.trim() || '{}');
    }
  } catch (e) {
    console.error("Ошибка парсинга JSON", e);
  }

  let pagesData = initialData.pages || [{ json: null }];
  let currentPageIndex = 0;
  let history = [];
  let historyStep = -1;
  let isDrawing = false;
  let currentLine;

  const stage = new Konva.Stage({
    container: 'canvas-container',
    width: container.offsetWidth,
    height: container.offsetHeight,
  });

  const layer = new Konva.Layer({
    clip: { x: 0, y: 0, width: stage.width(), height: stage.height() }
  });
  stage.add(layer);

  const pagesList = document.getElementById('pagesList');
  const addPageBtn = document.getElementById('addPageBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');
  const saveBtn = document.getElementById('saveCanvasBtn');

  // --- ИНИЦИАЛИЗАЦИЯ СПИСКА ---
  const renderPagesSidebar = () => {
    if (!pagesList) return;
    pagesList.innerHTML = ''; 
    pagesData.forEach((page, index) => {
      const li = document.createElement('li');
      if (index === currentPageIndex) li.classList.add('active');
      li.innerHTML = `
        <div class="page-thumbnail"></div>
        <span class="page-name">Page ${index + 1}</span>
      `;
      li.addEventListener('click', () => switchPage(index));
      pagesList.appendChild(li);
    });
  };

  const saveCurrentPageState = () => {
    pagesData[currentPageIndex].json = layer.toJSON();
  };

  const loadPageState = (index) => {
    layer.destroyChildren();
    if (pagesData[index] && pagesData[index].json) {
      const newLayer = Konva.Node.create(pagesData[index].json, 'canvas-container');
      newLayer.getChildren().forEach(node => layer.add(node.clone()));
    }
    layer.draw();
    history = [layer.toJSON()];
    historyStep = 0;
    updateButtons();
  };

  const switchPage = (index) => {
    if (index === currentPageIndex) return;
    saveCurrentPageState();
    currentPageIndex = index;
    document.querySelectorAll('.pages-list li').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    loadPageState(index);
  };

  const addNewPage = () => {
    if (!pagesList) return;
    saveCurrentPageState();
    pagesData.push({ json: null });
    currentPageIndex = pagesData.length - 1;
    renderPagesSidebar();
    loadPageState(currentPageIndex);
    setTimeout(() => {
      pagesList.scrollTo({ top: pagesList.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  if (addPageBtn) addPageBtn.addEventListener('click', addNewPage);

  // --- СВАЙП ВНИЗ ---
  const drawerContent = document.querySelector('.drawer-content');
  if (drawerContent) {
    let startY = 0;
    drawerContent.addEventListener('pointerdown', (e) => {
      if (e.target.closest('button')) return;
      startY = e.clientY;
    });
    document.addEventListener('pointerup', (e) => {
      if (startY === 0) return;
      if (e.clientY - startY > 60) addNewPage();
      startY = 0;
    });
  }

  // --- ИСТОРИЯ (UNDO/REDO) ---
  const updateButtons = () => {
    if (undoBtn && redoBtn) {
      undoBtn.disabled = historyStep <= 0;
      redoBtn.disabled = historyStep >= history.length - 1;
    }
  };

  const saveHistory = () => {
    history = history.slice(0, historyStep + 1);
    history.push(layer.toJSON());
    historyStep++;
    updateButtons();
  };

  const loadState = (step) => {
    layer.destroyChildren();
    const json = history[step];
    if (json) {
      const newLayer = Konva.Node.create(json, 'canvas-container');
      newLayer.getChildren().forEach(node => layer.add(node.clone()));
    }
    layer.draw();
  };

  if (undoBtn) undoBtn.addEventListener('click', () => {
    if (historyStep > 0) { historyStep--; loadState(historyStep); updateButtons(); }
  });

  if (redoBtn) redoBtn.addEventListener('click', () => {
    if (historyStep < history.length - 1) { historyStep++; loadState(historyStep); updateButtons(); }
  });

  // --- РИСОВАНИЕ ---
  const stopDrawing = () => {
    if (isDrawing) {
      isDrawing = false;
      saveHistory();
    }
  };

  stage.on('mousedown touchstart', (e) => {
    isDrawing = true;
    const pos = stage.getPointerPosition();
    currentLine = new Konva.Line({
      stroke: '#163A10', strokeWidth: 3, points: [pos.x, pos.y, pos.x, pos.y],
      lineCap: 'round', lineJoin: 'round',
    });
    layer.add(currentLine);
  });

  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return;
    const pos = stage.getPointerPosition();
    if (!pos) return; 
    if (pos.x < 0 || pos.y < 0 || pos.x > stage.width() || pos.y > stage.height()) {
      stopDrawing();
      return;
    }
    currentLine.points(currentLine.points().concat([pos.x, pos.y]));
    layer.batchDraw();
  });

  window.addEventListener('mouseup', stopDrawing);
  stage.on('mouseleave', stopDrawing);
  stage.on('mouseup touchend', stopDrawing);

  // ==========================================
  // 3. СОХРАНЕНИЕ (ТОЛЬКО ОДИН РАЗ!)
  // ==========================================
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveCurrentPageState();
      const noteId = document.querySelector('.note-editor-layout').dataset.noteId;
      // Получаем токен из meta-тега
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      
      if (!csrfToken) {
        alert("Ошибка: CSRF токен не найден. Проверь <%= csrf_meta_tags %> в layout.");
        return;
      }

      fetch(`/notes/${noteId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        credentials: 'same-origin',
        body: JSON.stringify({ note: { content: { pages: pagesData } } })
      })
      .then(response => {
        if (response.ok) {
          saveBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
          setTimeout(() => {
            saveBtn.innerHTML = '<span class="material-symbols-outlined">save</span>';
          }, 2000);
        } else {
          alert("Ошибка сохранения! Проверь консоль.");
          console.error(response);
        }
      })
      .catch(err => console.error("Fetch error:", err));
    });
  }

  // --- СТАРТ ---
  renderPagesSidebar();
  loadPageState(0); 

  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        stage.width(width); 
        stage.height(height); 
        layer.clip({ x: 0, y: 0, width: width, height: height });
        stage.draw();
      }
    }
  });
  resizeObserver.observe(container);
});