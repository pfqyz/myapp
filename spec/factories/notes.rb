FactoryBot.define do
  factory :note do
    sequence(:title) { |n| "Note #{n}" }
    is_active { true }
    is_shared { false }
  end
end