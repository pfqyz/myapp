Rails.application.routes.draw do
  root 'pages#index'
  get 'profile', to: 'pages#profile'
  resources :users, only: %i[new create] 
  # session[:user_id]
end
