class Note < ApplicationRecord
  has_many :user_notes, dependent: :destroy
  has_many :users, through: :user_notes

  has_many :authors, -> { where(user_notes: { role: "author" }) }, through: :user_notes, source: :user

  validates :title, presence: true, length: { maximum: 200 }

  scope :active, -> { where(is_active: true) }
  scope :shared, -> { where(is_shared: true) }
  scope :active, -> { where(deleted_at: nil) }
  scope :deleted, -> { where.not(deleted_at: nil) }

  def share!   = update!(is_shared: true)
  def unshare! = update!(is_shared: false)
  def archive! = update!(is_active: false)
  def restore! = update!(is_active: true)

  # Добавить соавтора
  def add_editor!(user)
    user_notes.find_or_create_by!(user: user) { |un| un.role = "editor" }
  end

  # Проверка прав
  def editable_by?(user)
    user_notes.exists?(user: user, role: %w[author editor])
  end

  def viewable_by?(user)
    is_shared || user_notes.exists?(user: user)
  end
end
