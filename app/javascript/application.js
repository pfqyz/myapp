import "@hotwired/turbo-rails"
import "controllers"

document.addEventListener("turbo:load", () => {
  
  // ==========================================
  // 1. ХОЛСТ, СТРАНИЦЫ, РИСОВАНИЕ
  // ==========================================
  const container = document.getElementById('canvas-container');
  const pagesTrack = document.getElementById('pagesTrack');
  const canvasArea = document.getElementById('canvasArea');
  
  if (!container || !pagesTrack || typeof Konva === 'undefined') return;

  const editorLayout = document.querySelector('.note-editor-layout');
  const noteId = editorLayout.dataset.noteId;
  const localKey = `note_data_${noteId}`;

  const initialDataElement = document.getElementById('note-initial-data');
  let initialData = {};
  try {
    if (initialDataElement) initialData = JSON.parse(initialDataElement.textContent.trim() || '{}');
  } catch (e) { console.error("Parse error", e); }

  let pagesData;
  const localData = localStorage.getItem(localKey);
  
  if (localData) {
    try { pagesData = JSON.parse(localData); } catch (e) { pagesData = initialData.pages; }
  } else {
    pagesData = initialData.pages;
  }
  
  if (!Array.isArray(pagesData) || pagesData.length === 0) {
    pagesData = [{ json: [] }];
  } else {
    pagesData = pagesData.map(p => ({ json: p.json || [] }));
  }

  let currentPageIndex = initialData.last_page || 0;
  if (currentPageIndex >= pagesData.length) currentPageIndex = 0;

  let history = [];
  let historyStep = -1;
  let isDrawing = false;
  let currentLine;
  let isSaving = false;

  const BASE_WIDTH = 1000;
  const BASE_HEIGHT = 707;

  const stage = new Konva.Stage({
    container: 'canvas-container',
    width: BASE_WIDTH,
    height: BASE_HEIGHT,
  });

  const layer = new Konva.Layer({
    clip: { x: 0, y: 0, width: BASE_WIDTH, height: BASE_HEIGHT }
  });
  stage.add(layer);

  const pagesList = document.getElementById('pagesList');
  const addPageBtn = document.getElementById('addPageBtn');
  const undoBtn = document.getElementById('undoBtn');
  const redoBtn = document.getElementById('redoBtn');

  let resizeObserver;
  let lastWidth = 0;
  let lastHeight = 0;

  const generateSvg = (jsonData) => {
    if (!jsonData || jsonData.length === 0) {
      return `<svg viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; background-color:#FFFFFF;"></svg>`;
    }
    let svgContent = '';
    jsonData.forEach(node => {
      if (node.className === 'Line') {
        const points = node.attrs.points;
        const stroke = node.attrs.stroke || '#163A10';
        const strokeWidth = node.attrs.strokeWidth || 3;
        let ptsString = [];
        for (let i = 0; i < points.length; i += 2) ptsString.push(`${points[i]},${points[i+1]}`);
        svgContent += `<polyline points="${ptsString.join(' ')}" stroke="${stroke}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round" stroke-linejoin="round" />`;
      }
    });
    return `<svg viewBox="0 0 ${BASE_WIDTH} ${BASE_HEIGHT}" xmlns="http://www.w3.org/2000/svg" style="width:100%; height:100%; background-color:#FFFFFF;">${svgContent}</svg>`;
  };

  const fitStage = () => {
    const activePage = document.querySelector(`.page-a4[data-index="${currentPageIndex}"]`);
    if (!activePage) return;
    const width = activePage.clientWidth;
    const height = activePage.clientHeight;
    if (width === 0 || height === 0) return;
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    stage.width(width);
    stage.height(height);
    stage.scale({ x: width / BASE_WIDTH, y: height / BASE_HEIGHT });
    stage.draw();
  };

  const setupResizeObserver = () => {
    if (resizeObserver) resizeObserver.disconnect();
    const activePage = document.querySelector(`.page-a4[data-index="${currentPageIndex}"]`);
    if (activePage) {
      resizeObserver = new ResizeObserver(() => requestAnimationFrame(fitStage));
      resizeObserver.observe(activePage);
    }
  };

  const updateTrackPosition = () => {
    const activePage = document.querySelector(`.page-a4[data-index="${currentPageIndex}"]`);
    if (!activePage) return;
    const containerHeight = canvasArea.offsetHeight;
    const pageHeight = activePage.offsetHeight;
    const pageTop = activePage.offsetTop;
    const targetY = (containerHeight / 2) - (pageHeight / 2);
    pagesTrack.style.transform = `translateY(${targetY - pageTop}px)`;
    fitStage();
  };

  const renderTrack = () => {
    try {
      container.style.visibility = 'hidden';
      if (container.parentNode) container.parentNode.removeChild(container);
      pagesTrack.innerHTML = ''; 
      pagesData.forEach((page, index) => {
        const pageDiv = document.createElement('div');
        pageDiv.className = 'page-a4';
        pageDiv.dataset.index = index;
        if (index !== currentPageIndex) pageDiv.innerHTML = generateSvg(page.json);
        pagesTrack.appendChild(pageDiv);
      });
      const activePage = document.querySelector(`.page-a4[data-index="${currentPageIndex}"]`);
      if (activePage) activePage.appendChild(container);
      updateTrackPosition();
      setupResizeObserver();
    } catch (e) {
      console.error("Ошибка рендера:", e);
    } finally {
      container.style.visibility = 'visible';
    }
  };

  const saveCurrentPageState = () => {
    pagesData[currentPageIndex].json = layer.getChildren().map(node => node.toJSON());
  };

  const saveToLocal = () => {
    saveCurrentPageState();
    localStorage.setItem(localKey, JSON.stringify(pagesData));
  };

  const switchPage = (index) => {
    if (index === currentPageIndex || index < 0 || index >= pagesData.length) return;
    saveToLocal(); 
    currentPageIndex = index;
    layer.destroyChildren();
    if (pagesData[currentPageIndex].json) {
      pagesData[currentPageIndex].json.forEach(nodeJson => layer.add(Konva.Node.create(nodeJson)));
    }
    layer.draw();
    renderTrack(); 
    renderPagesSidebar();
    saveHistory();
  };

  const addNewPage = () => {
    saveToLocal();
    pagesData.push({ json: [] });
    currentPageIndex = pagesData.length - 1;
    layer.destroyChildren();
    layer.draw();
    renderPagesSidebar();
    renderTrack();
    saveHistory();
    syncToBackend(); 
  };

  const deletePage = (index, event) => {
    event.stopPropagation(); 
    saveCurrentPageState();
    if (pagesData.length === 1) {
      pagesData[0] = { json: [] };
      layer.destroyChildren(); layer.draw();
      saveToLocal(); renderPagesSidebar(); renderTrack(); syncToBackend(); 
      return;
    }
    pagesData.splice(index, 1);
    if (currentPageIndex >= pagesData.length) currentPageIndex = pagesData.length - 1;
    else if (currentPageIndex > index) currentPageIndex--;
    layer.destroyChildren();
    if (pagesData[currentPageIndex] && pagesData[currentPageIndex].json) {
      pagesData[currentPageIndex].json.forEach(nodeJson => layer.add(Konva.Node.create(nodeJson)));
    }
    layer.draw();
    saveToLocal(); renderPagesSidebar(); renderTrack(); saveHistory(); syncToBackend(); 
  };

  const renderPagesSidebar = () => {
    if (!pagesList) return;
    pagesList.innerHTML = ''; 
    pagesData.forEach((page, index) => {
      const li = document.createElement('li');
      if (index === currentPageIndex) li.classList.add('active');
      const thumb = document.createElement('div');
      thumb.className = 'page-thumbnail';
      thumb.innerHTML = generateSvg(page.json);
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-page-btn';
      deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
      deleteBtn.addEventListener('click', (e) => deletePage(index, e));
      li.innerHTML = `<span class="page-name">Page ${index + 1}</span>`;
      li.prepend(thumb); li.appendChild(deleteBtn);
      li.addEventListener('click', () => switchPage(index));
      pagesList.appendChild(li);
    });
  };

  if (addPageBtn) addPageBtn.addEventListener('click', addNewPage);

  const updateButtons = () => {
    if (undoBtn && redoBtn) {
      undoBtn.disabled = historyStep <= 0;
      redoBtn.disabled = historyStep >= history.length - 1;
    }
  };

  const saveHistory = () => {
    saveToLocal(); 
    history = history.slice(0, historyStep + 1);
    history.push({ pages: JSON.parse(JSON.stringify(pagesData)), index: currentPageIndex });
    historyStep++;
    updateButtons();
  };

  const restoreHistory = (step) => {
    const snapshot = history[step];
    if (!snapshot) return;
    pagesData = JSON.parse(JSON.stringify(snapshot.pages));
    currentPageIndex = snapshot.index;
    renderPagesSidebar(); renderTrack();
    layer.destroyChildren();
    if (pagesData[currentPageIndex].json) {
      pagesData[currentPageIndex].json.forEach(nodeJson => layer.add(Konva.Node.create(nodeJson)));
    }
    layer.draw(); saveToLocal();
  };

  if (undoBtn) undoBtn.addEventListener('click', () => { if (historyStep > 0) { historyStep--; restoreHistory(historyStep); updateButtons(); } });
  if (redoBtn) redoBtn.addEventListener('click', () => { if (historyStep < history.length - 1) { historyStep++; restoreHistory(historyStep); updateButtons(); } });

  const stopDrawing = () => { if (isDrawing) { isDrawing = false; saveHistory(); } };

  stage.on('mousedown touchstart', (e) => {
    isDrawing = true;
    const pos = stage.getRelativePointerPosition();
    currentLine = new Konva.Line({
      stroke: '#163A10', strokeWidth: 3, points: [pos.x, pos.y, pos.x, pos.y],
      lineCap: 'round', lineJoin: 'round',
    });
    layer.add(currentLine);
  });

  stage.on('mousemove touchmove', () => {
    if (!isDrawing) return;
    const pos = stage.getRelativePointerPosition();
    if (!pos || pos.x < 0 || pos.y < 0 || pos.x > BASE_WIDTH || pos.y > BASE_HEIGHT) { stopDrawing(); return; }
    currentLine.points(currentLine.points().concat([pos.x, pos.y]));
    layer.batchDraw();
  });

  window.addEventListener('mouseup', stopDrawing);
  stage.on('mouseleave', stopDrawing);

  let touchStartY = 0, isSwiping = false, wasDrawing = false;
  container.addEventListener('touchstart', (e) => { touchStartY = e.touches[0].clientY; isSwiping = true; wasDrawing = isDrawing; }, { passive: true });
  container.addEventListener('touchmove', (e) => { if (!isSwiping || wasDrawing) return; if (Math.abs(e.touches[0].clientY - touchStartY) > 10) e.preventDefault(); }, { passive: false });
  container.addEventListener('touchend', (e) => {
    if (!isSwiping || wasDrawing) return; isSwiping = false;
    const deltaY = e.changedTouches[0].clientY - touchStartY;
    if (Math.abs(deltaY) > 40) {
      if (deltaY < 0) { if (currentPageIndex < pagesData.length - 1) switchPage(currentPageIndex + 1); else addNewPage(); }
      else { if (currentPageIndex > 0) switchPage(currentPageIndex - 1); }
    }
  }, { passive: true });

  let isWheeling = false;
  canvasArea.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (isWheeling) return; isWheeling = true; setTimeout(() => isWheeling = false, 300);
    if (e.deltaY > 0 && currentPageIndex < pagesData.length - 1) switchPage(currentPageIndex + 1);
    else if (e.deltaY < 0 && currentPageIndex > 0) switchPage(currentPageIndex - 1);
  }, { passive: false });

  const syncToBackend = () => {
    if (isSaving) return;
    saveCurrentPageState();
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (!csrfToken) return;
    isSaving = true;
    fetch(`/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken },
      credentials: 'same-origin',
      body: JSON.stringify({ note: { content: { pages: pagesData, last_page: currentPageIndex } } })
    }).then(res => {
      isSaving = false;
      if (res.ok) localStorage.removeItem(localKey);
    }).catch(err => { isSaving = false; });
  };

  document.addEventListener("turbo:before-visit", () => syncToBackend());
  window.addEventListener('beforeunload', () => syncToBackend());
  window.addEventListener('pagehide', () => syncToBackend());

  renderPagesSidebar(); renderTrack();
  if (pagesData[currentPageIndex].json) {
    pagesData[currentPageIndex].json.forEach(nodeJson => layer.add(Konva.Node.create(nodeJson)));
  }
  layer.draw(); saveHistory();
});

// ==========================================
// 5. ГЛОБАЛЬНЫЕ ОБРАБОТЧИКИ (МОДАЛКИ И УДАЛЕНИЕ)
// Работают ВСЕГДА, даже если Turbo перезагрузит кусок страницы
// ==========================================
document.addEventListener('click', (e) => {
  // --- Модальное окно Создания ---
  const openBtn = e.target.closest('#openModalBtn');
  const closeBtn = e.target.closest('#closeModalBtn');
  const modal = document.getElementById('noteModal');

  if (openBtn && modal) {
    modal.showModal();
    const input = document.getElementById('note_title_input');
    const submitBtn = document.getElementById('submitNoteBtn');
    if (input) input.value = "";
    if (submitBtn) submitBtn.disabled = true;
  }

  if (closeBtn && modal) {
    modal.close();
  }

  // --- Окончательное удаление из Корзины ---
  const hardDeleteBtn = e.target.closest('.hard-delete-btn');
  if (hardDeleteBtn) {
    e.preventDefault();
    const card = hardDeleteBtn.closest('.deleted-card');
    const noteId = card.dataset.noteId;
    if (confirm("Удалить эту заметку НАВСЕГДА?")) {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
      fetch(`/notes/${noteId}/hard_delete`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken },
        credentials: 'same-origin'
      }).then(res => {
        if (res.ok) {
          card.style.opacity = '0';
          setTimeout(() => card.remove(), 300);
        }
      });
    }
  }
});

// Ввод в поле названия заметки
document.addEventListener('input', (e) => {
  if (e.target.id === 'note_title_input') {
    const submitBtn = document.getElementById('submitNoteBtn');
    if (submitBtn) submitBtn.disabled = e.target.value.trim() === "";
  }
});

// --- ПКМ (Контекстное меню на удаление заметки) ---
document.addEventListener('contextmenu', (e) => {
  const card = e.target.closest('.notes-grid .note-card:not(.deleted-card)');
  if (card) {
    e.preventDefault(); 
    const noteId = card.dataset.noteId;
    if (!noteId) return;

    if (confirm("Переместить эту заметку в корзину?")) {
      const csrfToken = document.querySelector('meta[name="csrf-token"]').content;
      fetch(`/notes/${noteId}`, {
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken },
        credentials: 'same-origin'
      }).then(res => {
        if (res.ok) {
          card.style.opacity = '0';
          setTimeout(() => card.remove(), 300); 
        }
      });
    }
  }
});