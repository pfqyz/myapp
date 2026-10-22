class UserNote < ApplicationRecord
  belongs_to :user
  belongs_to :note

  ROLES = %w[author editor viewer].freeze

  validates :role, presence: true, inclusion: { in: ROLES }
  validates :user_id, uniqueness: { scope: :note_id}
end