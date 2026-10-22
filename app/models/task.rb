class Task < ApplicationRecord
  has_many :user_tasks, dependent: :destroy
  has_many :users, through: :user_tasks

  has_many :assignees, -> { where(user_tasks: { role: "assignee" }) }, through: :user_tasks, source: :user

  enum :status, { pending: 0, in_progress: 1, completed: 2, cancelled: 3 }

  validates :text, presence: true, length: { minimum: 3 }

  scope :important, -> { where(is_important: true) }
  scope :today,     -> { where(date: Date.current) }
  scope :overdue,   -> { where("date < ? AND status != ?", Date.current, statuses[:completed]) }


  def complete! = update!(status: :completed)
  def cancel!   = update!(status: :cancelled)
  def start!    = update!(status: :in_progress)

  def reschedule_to!(new_date)
    update!(date: new_date, reschedule: true, status: :pending)
  end

  def overdue?
    date.present? && date < Date.current && !completed? && !cancelled?
  end

  def days_until_due
    date.present? ? (date - Date.current).to_i : nil
  end

  # Назначить исполнителя
  def assign_to!(user)
    user_tasks.find_or_create_by!(user: user) { |ut| ut.role = "assignee" }
  end

  # Кто может редактировать задачу
  def editable_by?(user)
    user_tasks.exists?(user: user, role: %w[creator assignee])
  end
end