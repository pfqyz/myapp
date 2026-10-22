FactoryBot.define do
  factory :task do
    sequence(:text) { |n| "Task number #{n}" }
    is_important { false }
    status { :pending }
    date { Date.current + 1 }
    reschedule { false }
  end
end