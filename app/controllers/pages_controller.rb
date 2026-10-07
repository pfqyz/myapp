class PagesController < ApplicationController
  def index
  end

  def profile
    @user = current_user

    redirect_to login_path, alert: "Please, log in account" if @user.nil?
  end

end