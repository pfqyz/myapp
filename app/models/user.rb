class User < ApplicationRecord
  has_secure_password
validates :password, 
  length: { minimum: 9, message: "должен быть длиннее 8 символов" }, 
  format: { with: /[^A-Za-z0-9]/, message: "должен содержать хотя бы один специальный символ (!@#$%^&* и т.д.)" },
  if: -> { password.present? }

  # --- ВАЛИДАЦИИ EMAIL ---
  validates :email, presence: true, uniqueness: { case_sensitive: false }, email: true

  validates :name,     presence: true
  validates :nickname, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A[a-zA-Z0-9_]+\z/ }
  before_validation :normalize_email

  # Many-to-many
  has_many :user_notes, dependent: :destroy
  has_many :user_tasks, dependent: :destroy

  has_many :notes, through: :user_notes
  has_many :tasks, through: :user_tasks

  has_many :folders, dependent: :destroy

  # Заметки, где пользователь — автор
  has_many :authored_notes, -> { where(user_notes: { role: "author" }) }, through: :user_notes, source: :note

  # Задачи, где пользователь — исполнитель
  has_many :assigned_tasks, -> { where(user_tasks: { role: "assignee" })}, through: :user_tasks, source: :task
  # Прикрепить заметку с ролью
  def attach_note!(note, role: "viewer")
    user_notes.create!(note: note, role: role)
  end

  # Назначить задачу
  def assign_task!(task, role: "assignee")
    user_tasks.create!(task: task, role: role)
  end

  # Все заметки, доступные пользователю (автор + редактор + читатель)
  def accessible_notes
    notes.distinct
  end

  def activity_summary
    {
      notes_count:     notes.count,
      authored_notes:  authored_notes.count,
      tasks_count:     tasks.count,
      assigned_tasks:  assigned_tasks.count
    }
  end

  private

  def normalize_email
    self.email = email.to_s.strip.downcase
  end
end
