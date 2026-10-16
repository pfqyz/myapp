class User < ApplicationRecord
  has_secure_password
  validates :name,     presence: true
  validates :nickname, presence: true, uniqueness: { case_sensitive: false }, format: { with: /\A[a-zA-Z0-9_]+\z/ }
  validates :email,    presence: true, uniqueness: { case_sensitive: false }, format: { with: URI::MailTo::EMAIL_REGEXP }

  before_validation :normalize_email

  # Many-to-many
  has_many :user_notes, dependent: :destroy
  has_many :user_tasks, dependent: :destroy

  has_many :notes, through: :user_notes
  has_many :tasks, through: :user_tasks

  # Заметки, где пользователь — автор
  has_many :authored_notes, -> { where(user_notes: { role: "author" }) }, through: :user_notes, source: :note

  # Задачи, где пользователь — исполнитель
  has_many :assigned_tasks, -> { where(user_tasks: { role: "assignee" })}, through: :user_tasks, source: :task
end
