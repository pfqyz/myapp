class UsersController < ApplicationController

  def new
    @user = User.new
  end

  def create
    @user = User.new(user_params)
    if @user.save
      flash[:success] = "Welcome to app, #{@user.name}!"
      redirect_to root_path
    else
      render :new
    end
  end
  
  def index
    # return @user.id 
  end

  def show 
    # return @user
  end

  def destroy
    # @user.destroy
    # if @user.exit?
    #   flash[:success] = "Your account is deleted!"
    #   redirect_to root_path
    # else
    #   render :new
    # end
  end

  private

  def user_params
    params.require(:user).permit(:email, :name, :nickname, :password, :password_confirmation)
  end
end