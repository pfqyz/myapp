class AddHasNotesToUsers < ActiveRecord::Migration[8.1]
  def change
    add_column :users, :has_notes, :boolean, default: false
  end
end
