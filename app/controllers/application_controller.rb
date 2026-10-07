class ApplicationController < ActionController::Base

  helper_method :current_user, :logged_in?

  def current_user
    @current_user ||= User.find_by(id: session[:user_id]) if session[:user_id]
  end

  def logged_in?
    current_user.present?
  end

  def require_user
    unless logged_in?
      flash[:alert] = "You must log in"
      redirect_to login_path
    end
  end

end
