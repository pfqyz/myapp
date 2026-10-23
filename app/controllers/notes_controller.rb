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
    @note = current_user.notes.find(params[:id])
  end
  private

  def note_params
    params.require(:note).permit(:title)
  end
end