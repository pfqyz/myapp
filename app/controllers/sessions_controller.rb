class SessionsController < ApplicationController

  def new
    
  end
  

  def create
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      session[:user_id] = user.id # Создаем сессию
      redirect_to root_path, notice: "success!"
    else
      flash.now[:alert] = "Invalid email address or password"
      render :new
    end
  end
  
  def destroy
    reset_session
    redirect_to root_path, notice: "You are log out"
  end
end