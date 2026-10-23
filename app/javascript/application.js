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