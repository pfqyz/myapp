// Configure your import map in config/importmap.rb. Read more: https://github.com/rails/importmap-rails
import "@hotwired/turbo-rails"
import "controllers"
document.addEventListener("turbo:load", () => {
  const modal = document.getElementById("noteModal");
  const openBtn = document.getElementById("openModalBtn");
  const closeBtn = document.getElementById("closeModalBtn");
  const input = document.getElementById("note_title_input");
  const submitBtn = document.getElementById("submitNoteBtn");

  // Если элементы есть на странице (мы на главной)
  if (modal && openBtn) {
    // 1. Открытие окна
    openBtn.addEventListener("click", () => {
      modal.showModal();
      input.value = ""; // Очищаем поле
      submitBtn.disabled = true; // Блокируем кнопку при открытии
    });

    // 2. Закрытие окна по кнопке Back
    closeBtn.addEventListener("click", () => {
      modal.close();
    });

    // 3. Проверка ввода (разблокировка кнопки)
    input.addEventListener("input", (e) => {
      // .trim() убирает пробелы по краям. Если пусто — кнопка неактивна
      submitBtn.disabled = e.target.value.trim() === "";
    });
  }
});
document.addEventListener("turbo:load", () => {
  // --- ЛОГИКА РЕДАКТИРОВАНИЯ ПРОФИЛЯ ---
  const editBtn = document.getElementById('editProfileBtn');
  const cancelBtn = document.getElementById('cancelEditBtn');
  const viewActions = document.getElementById('viewModeActions');
  const editActions = document.getElementById('editModeActions');
  const profileForm = document.getElementById('profileForm');
  
  if (editBtn && profileForm) {
    const inputs = profileForm.querySelectorAll('.profile-input');
    
    // Нажали "Edit profile"
    editBtn.addEventListener('click', () => {
      viewActions.style.display = 'none';
      editActions.style.display = 'flex';
      
      inputs.forEach(input => {
        input.removeAttribute('readonly');
      });
      
      inputs[0].focus();
    });

    // Нажали "Back" (отмена)
    cancelBtn.addEventListener('click', () => {
      viewActions.style.display = 'flex';
      editActions.style.display = 'none';
      
      inputs.forEach(input => {
        input.setAttribute('readonly', true);
      });
      
      profileForm.reset(); // Сбрасываем изменения
    });
  }

  // --- ЛОГИКА МОДАЛЬНОГО ОКНА УДАЛЕНИЯ ---
  const deleteModal = document.getElementById('deleteProfileModal');
  const openDeleteBtn = document.getElementById('openDeleteModalBtn');
  const closeDeleteBtn = document.getElementById('closeDeleteModalBtn');

  if (deleteModal && openDeleteBtn) {
    openDeleteBtn.addEventListener('click', () => {
      deleteModal.showModal();
    });

    closeDeleteBtn.addEventListener('click', () => {
      deleteModal.close();
    });
  }
});