require 'rails_helper'

RSpec.describe User, type: :model do
  let(:user) { create(:user) }
  let(:note) { create(:note) }
  let(:task) { create(:task) }

  describe "#attach_note!" do
    context "когда роль не указана" do
      it "прикрепляет заметку с ролью viewer по умолчанию" do
        user.attach_note!(note)
        expect(user.user_notes.last.role).to eq("viewer")
      end
    end

    context "когда роль указана явно" do
      it "прикрепляет заметку с указанной ролью" do
        user.attach_note!(note, role: "editor")
        expect(user.user_notes.last.role).to eq("editor")
      end
    end
  end

  describe "#assign_task!" do
    it "назначает задачу на пользователя" do
      user.assign_task!(task)
      expect(user.tasks).to include(task)
      expect(user.user_tasks.last.role).to eq("assignee")
    end
  end

  describe "#activity_summary" do
    it "возвращает корректную статистику активности" do
      user.attach_note!(note, role: "author")
      user.assign_task!(task)
      
      summary = user.activity_summary
      expect(summary[:notes_count]).to eq(1)
      expect(summary[:authored_notes]).to eq(1)
      expect(summary[:tasks_count]).to eq(1)
      expect(summary[:assigned_tasks]).to eq(1)
    end
  end
end