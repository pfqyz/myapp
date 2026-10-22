class UserTask < ApplicationRecord
  belongs_to :user
  belongs_to :task

  ROLES = %w[creator assignee watcher].freeze

  validates :role, presence: true, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :task_id, message: "уже связан с этой задачей" }
end