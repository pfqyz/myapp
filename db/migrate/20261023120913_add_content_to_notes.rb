class AddContentToNotes < ActiveRecord::Migration[8.1]
  def change
    # Используем :json. Если у тебя PostgreSQL, можешь поменять на :jsonb
    add_column :notes, :content, :json, default: {}, null: false
  end
end
