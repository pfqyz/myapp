module ApplicationHelper
  def icon_link_to(text, path, icon_name, options = {})
    default_classes = "custom-icon-link"
    options[:class] = "#{default_classes} #{options[:class]}".strip

    # Проверяем, какой метод передан: если :delete, то генерируем форму через button_to
    if options[:data]&.[](:turbo_method) == :delete || options[:method] == :delete
      # Извлекаем параметры данных для формы, если они есть
      data_options = options.delete(:data) || {}
      
      button_to(path, method: :delete, class: options[:class], data: data_options) do
        icon_tag = content_tag(:span, icon_name, class: "material-symbols-outlined custom-icon")
        text_tag = content_tag(:span, text, class: "link-text")
        icon_tag + text_tag
      end
    else
      link_to(path, options) do
        icon_tag = content_tag(:span, icon_name, class: "material-symbols-outlined custom-icon")
        text_tag = content_tag(:span, text, class: "link-text")
        icon_tag + text_tag
      end
    end
  end
end
