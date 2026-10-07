Rails.application.routes.draw do
  root 'pages#index'
  resources :users, only: %i[new create] 
  session[:user_id]
end
