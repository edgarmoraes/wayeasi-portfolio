from django import template
from decimal import Decimal, InvalidOperation
import locale

register = template.Library()

@register.filter(name='currency_br')
def currency_br(value):
    try:
        if isinstance(value, str):
            value = Decimal(value.replace(',', '.'))
        locale.setlocale(locale.LC_ALL, 'pt_BR.UTF-8')
        return locale.currency(value, grouping=True)
    except (ValueError, TypeError, InvalidOperation):
        return value