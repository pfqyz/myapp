class PagesController < ApplicationController
  def index
    redirect_to main_path if logged_in?
  end

  def main
    if logged_in?
      @user = current_user
      @notes = current_user.notes.order(created_at: :desc)
    else
      redirect_to root_path, alert: "Please, log in account"
    end
  end

  def profile
    @user = current_user

    redirect_to login_path, alert: "Please, log in account" if @user.nil?
  end

  def folders
    @user = current_user
  end

  def schedule
    @user = current_user
  end

  def deleted_files
    @user = current_user
    @deleted_notes = current_user.notes.deleted
  end

end