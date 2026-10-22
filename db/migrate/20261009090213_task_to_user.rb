class TaskToUser < ActiveRecord::Migration[8.1]
  def change
    create_table :user_tasks do |t|
      t.references :user, null: false, foreign_key: true
      t.references :task, null: false, foreign_key: true
      t.string :role, null: false, default: "assignee"  # assignee/creator/watcher
      t.timestamps
    end

    add_index :user_tasks, [:user_id, :task_id], unique: true
    add_index :user_tasks, :role
  end
end
