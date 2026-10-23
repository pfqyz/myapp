# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_23_120913) do
  create_table "folders", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "title"
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["user_id"], name: "index_folders_on_user_id"
  end

  create_table "notes", force: :cascade do |t|
    t.json "content", default: {}, null: false
    t.datetime "created_at", null: false
    t.boolean "is_active"
    t.boolean "is_shared"
    t.string "title"
    t.datetime "updated_at", null: false
  end

  create_table "tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.date "date"
    t.boolean "is_important"
    t.boolean "reschedule"
    t.integer "status"
    t.text "text"
    t.datetime "updated_at", null: false
  end

  create_table "user_notes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.integer "note_id", null: false
    t.string "role", default: "author", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["note_id"], name: "index_user_notes_on_note_id"
    t.index ["role"], name: "index_user_notes_on_role"
    t.index ["user_id", "note_id"], name: "index_user_notes_on_user_id_and_note_id", unique: true
    t.index ["user_id"], name: "index_user_notes_on_user_id"
  end

  create_table "user_tasks", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "role", default: "assignee", null: false
    t.integer "task_id", null: false
    t.datetime "updated_at", null: false
    t.integer "user_id", null: false
    t.index ["role"], name: "index_user_tasks_on_role"
    t.index ["task_id"], name: "index_user_tasks_on_task_id"
    t.index ["user_id", "task_id"], name: "index_user_tasks_on_user_id_and_task_id", unique: true
    t.index ["user_id"], name: "index_user_tasks_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", null: false
    t.boolean "google_account"
    t.boolean "has_notes", default: false
    t.string "name", null: false
    t.string "nickname", null: false
    t.string "password_digest"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["nickname"], name: "index_users_on_nickname", unique: true
  end

  add_foreign_key "folders", "users"
  add_foreign_key "user_notes", "notes"
  add_foreign_key "user_notes", "users"
  add_foreign_key "user_tasks", "tasks"
  add_foreign_key "user_tasks", "users"
end
