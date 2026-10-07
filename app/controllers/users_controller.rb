class UsersController < ApplicationController

  before_action :require_user, only: [:show, :destroy]

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save

      session[:user_id] = @user.id 
      
      flash[:success] = "Welcome to app, #{@user.name}!"
      
      redirect_to root_path, notice:"You have successfully registered and logged into your account!"
    else
      render :new, status: :unprocessable_entity 
    end
  end
  
  def index
    @users = User.all
  end

  def show 
    @user = User.find(params[:id]) 
  end

  def destroy
    if current_user.destroy
      session[:user_id] = nil
      flash[:success] = "Your account is deleted!"
      redirect_to root_path, status: :see_other
    else
      flash[:error] = "Something went wrong"
      redirect_to user_path(current_user)
    end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :nickname, :password, :password_confirmation)
  end
end