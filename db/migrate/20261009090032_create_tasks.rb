class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.text :text, null: false
      t.boolean :is_important, default:false, null: false
      t.integer :status, default: 0, null: false
      t.date :date
      t.boolean :reschedule, default: false, null: false

      t.timestamps
    end
  end
end
