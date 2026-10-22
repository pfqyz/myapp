require 'rails_helper'

RSpec.describe Note, type: :model do
  let(:note) { create(:note) }
  let(:author) { create(:user) }
  let(:other_user) { create(:user) }

  describe "#add_editor!" do
    it "добавляет соавтора с ролью editor" do
      note.add_editor!(other_user)
      expect(note.user_notes.find_by(user: other_user).role).to eq("editor")
    end

    it "не создает дубликат связи" do
      note.add_editor!(other_user)
      expect { note.add_editor!(other_user) }.not_to change(UserNote, :count)
    end
  end

  describe "права доступа (#viewable_by? и #editable_by?)" do
    before do
      note.user_notes.create!(user: author, role: "author")
    end

    context "когда пользователь - автор" do
      it "может редактировать и просматривать" do
        expect(note.editable_by?(author)).to be true
        expect(note.viewable_by?(author)).to be true
      end
    end

    context "когда пользователь посторонний" do
      it "не может редактировать приватную заметку" do
        expect(note.editable_by?(other_user)).to be false
        expect(note.viewable_by?(other_user)).to be false
      end

      it "может просматривать, если заметка публичная" do
        note.update!(is_shared: true)
        expect(note.viewable_by?(other_user)).to be true
      end
    end
  end
end