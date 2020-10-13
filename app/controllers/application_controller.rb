class ApplicationController < ActionController::Base
  # 全ページをログイン必須とする
  before-action :authenticate_user!
end
