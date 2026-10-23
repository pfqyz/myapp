class NotesController < ApplicationController
  before_action :require_user

  def create
    # Создаем саму заметку
    @note = Note.new(note_params)
    
    if @note.save
      # Связываем с пользователем (так как у нас связь многие-ко-многим через user_notes)
      current_user.user_notes.create(note: @note, role: "author")
      redirect_to main_path, notice: "Note created!"
    else
      redirect_to main_path, alert: "Title can't be blank"
    end
  end

  private

  def note_params
    params.require(:note).permit(:title)
  end
end