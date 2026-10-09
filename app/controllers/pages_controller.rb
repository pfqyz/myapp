class PagesController < ApplicationController
  def index
    redirect_to main_path if logged_in?
  end

  def main
    if logged_in?
      @user = current_user
    else
      redirect_to root_path, alert: "Please, log in account"
    end
  end

  def profile
    @user = current_user

    redirect_to login_path, alert: "Please, log in account" if @user.nil?
  end

end