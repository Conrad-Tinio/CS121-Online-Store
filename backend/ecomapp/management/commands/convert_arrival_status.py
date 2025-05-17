from django.core.management.base import BaseCommand
from ecomapp.models import Products, TagType, Tag

class Command(BaseCommand):
    help = 'Converts existing arrival_status values to tags'

    def handle(self, *args, **kwargs):
        # Create Arrival tag type
        arrival_type, created = TagType.objects.get_or_create(
            name='Arrival',
            defaults={'description': 'Product arrival status'}
        )
        self.stdout.write(f'{"Created" if created else "Found"} Arrival tag type')

        # Create arrival tags
        arrival_tags = {}
        for status in ['new', 'recent', 'classic']:
            tag, created = Tag.objects.get_or_create(
                name=status.title(),  # Capitalize first letter
                tag_type=arrival_type
            )
            arrival_tags[status] = tag
            self.stdout.write(f'{"Created" if created else "Found"} {status} tag')

        # Convert existing products
        products = Products.objects.all()
        for product in products:
            # Get the old arrival status from __dict__ since the field is now removed
            old_status = product.__dict__.get('arrival_status', 'classic')
            if old_status in arrival_tags:
                product.tags.add(arrival_tags[old_status])
                self.stdout.write(f'Added {arrival_tags[old_status]} tag to {product.productName}') 