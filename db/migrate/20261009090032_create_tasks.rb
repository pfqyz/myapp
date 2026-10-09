class CreateTasks < ActiveRecord::Migration[8.1]
  def change
    create_table :tasks do |t|
      t.text :text
      t.boolean :is_important
      t.integer :status
      t.date :date
      t.boolean :reschedule

      t.timestamps
    end
  end
end
