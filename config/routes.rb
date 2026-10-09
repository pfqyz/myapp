Rails.application.routes.draw do
  root 'pages#index'

  get '/main', to: 'pages#main', as: 'main'
  
  get '/profile', to: 'pages#profile', as: 'profile'

  get '/login', to: 'sessions#new', as: :login

  post '/login', to: 'sessions#create'

  delete '/logout', to: 'sessions#destroy', as: :logout

  resources :users, only: %i[new create] 
end
