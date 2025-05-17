from django.core.management.base import BaseCommand
from ecomapp.models import Products, TagType, Tag

class Command(BaseCommand):
    help = 'Inspects the current state of tags in the database'

    def handle(self, *args, **kwargs):
        # Print all tag types
        self.stdout.write("\n=== Tag Types ===")
        for tag_type in TagType.objects.all():
            self.stdout.write(f"\nType: {tag_type.name}")
            self.stdout.write("Tags in this type:")
            for tag in tag_type.tags.all():
                self.stdout.write(f"- {tag.name}")

        # Print all products and their tags
        self.stdout.write("\n=== Products and Their Tags ===")
        for product in Products.objects.prefetch_related('tags', 'tags__tag_type').all():
            self.stdout.write(f"\nProduct: {product.productName}")
            if product.tags.exists():
                self.stdout.write("Tags:")
                for tag in product.tags.all():
                    self.stdout.write(f"- {tag.tag_type.name}: {tag.name}")
            else:
                self.stdout.write("No tags") 