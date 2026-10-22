FactoryBot.define do
  factory :user_note do
    user
    note
    role { "viewer" }
  end
end