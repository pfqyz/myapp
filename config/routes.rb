Rails.application.routes.draw do
  root 'pages#index'

  get '/main', to: 'pages#main', as: 'main'
  
  get '/profile', to: 'pages#profile', as: 'profile'

  get '/login', to: 'sessions#new', as: :login

  post '/login', to: 'sessions#create'

  delete '/logout', to: 'sessions#destroy', as: :logout

  resources :users, only: %i[new create] 

  get 'folders', to: 'pages#folders', as: :folders
  get 'schedule', to: 'pages#schedule', as: :schedule
  get 'deleted_files', to: 'pages#deleted_files', as: :deleted_files

  resources :notes, only: [:create]
end
