FactoryBot.define do
  factory :user_task do
    user
    task
    role { "watcher" }
  end
end