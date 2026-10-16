class CreateNotes < ActiveRecord::Migration[8.1]
  def change
    create_table :notes do |t|
      t.string :title, null: false
      t.boolean :is_active, default: true,  null: false
      t.boolean :is_shared, default: false, null: false

      t.timestamps
    end
  end
end
