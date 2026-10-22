require 'rails_helper'

RSpec.describe Task, type: :model do
  let(:task) { create(:task, status: :pending) }
  let(:user) { create(:user) }

  describe "#assign_to!" do
    it "назначает задачу исполнителю" do
      task.assign_to!(user)
      expect(task.assignees).to include(user)
    end

    it "не создает дубликат исполнителя" do
      task.assign_to!(user)
      expect { task.assign_to!(user) }.not_to change(UserTask, :count)
    end
  end

  describe "#reschedule_to!" do
    it "меняет дату, ставит флаг reschedule и возвращает статус pending" do
      new_date = Date.current + 7
      task.update!(status: :in_progress)
      task.reschedule_to!(new_date)
      
      task.reload
      expect(task.date).to eq(new_date)
      expect(task.reschedule).to be true
      expect(task.status).to eq("pending")
    end
  end

  describe "#overdue?" do
    it "возвращает true для просроченной задачи" do
      task = build(:task, date: Date.current - 1, status: :pending)
      expect(task.overdue?).to be true
    end

    it "возвращает false для завершенной задачи" do
      task = build(:task, date: Date.current - 1, status: :completed)
      expect(task.overdue?).to be false
    end
  end
end