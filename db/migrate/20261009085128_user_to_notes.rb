class CreateUserNotes < ActiveRecord::Migration[8.1]
  def change
    create_table :user_notes do |t|
      t.references :user, null: false, foreign_key: true
      t.references :note, null: false, foreign_key: true
      t.string :role, null: false, default: "author"  # author/editor/viewer
      t.timestamps
    end

    add_index :user_notes, [:user_id, :note_id], unique: true
    add_index :user_notes, :role
  end
end
