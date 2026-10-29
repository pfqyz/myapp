class NotesController < ApplicationController
  before_action :require_user

    def create
    @note = Note.new(note_params)
    
      if @note.save
        current_user.user_notes.create(note: @note, role: "author")
        current_user.update(has_notes: true) # <--- ДОБАВИЛИ ЭТУ СТРОКУ
        redirect_to main_path, notice: "Note created!"
      else
        redirect_to main_path, alert: "Title can't be blank"
      end
    end
  def show
    @user = current_user
    @note = current_user.notes.find(params[:id])
  end

  def update
    @note = current_user.notes.find(params[:id])
    if @note.update(note_params)
      head :ok # Отвечаем 200 OK без перезагрузки страницы
    else
      head :unprocessable_entity
    end
  end
  def destroy
    @note = current_user.notes.find(params[:id])
    @note.update(deleted_at: Time.current)
    head :ok
  end

  def hard_delete
    @note = current_user.notes.find(params[:id])
    @note.destroy
    head :ok
  end
  private

  def note_params
    # Разрешаем сохранять весь JSON внутри content (включая массивы и строки)
    params.require(:note).permit(:title, content: {})
  end
end