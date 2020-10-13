Rails.application.routes.draw do
  devise_for :users
  # get 'graphs/index' は削除
  # ***** 以下を追加 *****
  root "graphs#index"
  # ***** 以上を追加 *****
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
