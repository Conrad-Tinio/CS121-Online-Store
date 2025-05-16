from django.core.management.base import BaseCommand
from ecomapp.models import Products
import random

class Command(BaseCommand):
    help = 'Updates arrival status for existing products'

    def handle(self, *args, **kwargs):
        products = Products.objects.all()
        statuses = ['new', 'recent', 'classic']
        
        for product in products:
            # Randomly assign an arrival status
            product.arrival_status = random.choice(statuses)
            product.save()
            self.stdout.write(
                self.style.SUCCESS(
                    f'Updated {product.productName} to {product.arrival_status}'
                )
            ) 