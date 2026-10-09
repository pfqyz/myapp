class CreateNotes < ActiveRecord::Migration[8.1]
  def change
    create_table :notes do |t|
      t.string :title
      t.boolean :is_active
      t.boolean :is_shared

      t.timestamps
    end
  end
end
