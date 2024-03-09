from django import template
import locale

register = template.Library()

@register.filter(name='format_number')
def format_number(value):
    try:
        locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')
        return locale.format_string('%.2f', value, grouping=True)
    except (ValueError, TypeError):
        return value
