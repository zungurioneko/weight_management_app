Rails.application.routes.draw do
  devise_for :users
  # get 'graphs/index' は削除
  # ***** 以下を追加 *****
  root "graphs#index"
  # ***** 以上を追加 *****
  # ********** 以下を追加 **********
  # resource「s」ではない！（updateに「:id」は不要だから）
  resource :graphs, only: %i[index create update]
  # ********** 以上を追加 **********
  # For details on the DSL available within this file, see https://guides.rubyonrails.org/routing.html
end
