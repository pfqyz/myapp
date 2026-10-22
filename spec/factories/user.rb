FactoryBot.define do
  factory :user do
    sequence(:name)     { |n| "User #{n}" }
    sequence(:nickname) { |n| "user_#{n}" }
    sequence(:email)    { |n| "user#{n}@example.com" }
    password { "password123" }
    google_account { false }
  end
end