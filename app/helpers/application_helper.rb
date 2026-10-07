module ApplicationHelper

  def icon_link_to(text, path, icon_name, options = {})
    # Задаем свой собственный класс вместо Bootstrap
    default_classes = "custom-icon-link"
    options[:class] = "#{default_classes} #{options[:class]}".strip

    link_to(path, options) do
      # Добавляем класс custom-icon для точечной настройки иконки
      icon_tag = content_tag(:span, icon_name, class: "material-symbols-outlined custom-icon")
      text_tag = content_tag(:span, text, class: "link-text")
      
      icon_tag + text_tag
    end
  end

end

