from django import template
from decimal import Decimal

register = template.Library()

@register.filter(name='add_decimal')
def add_decimal(value, arg):
    try:
        return Decimal(value) + Decimal(arg)
    except:
        return None