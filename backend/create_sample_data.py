import os
import sys
import django

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'skillsphere.settings')
django.setup()

from users.models import User
from courses.models import Category

# Create superuser admin
print("Creating Admin user...")
if not User.objects.filter(email='admin@skillsphere.com').exists():
    admin = User.objects.create_user(
        email='admin@skillsphere.com',
        password='admin123',
        first_name='Admin',
        last_name='User',
        role='ADMIN'
    )
    print(f"✅ Admin created: admin@skillsphere.com / admin123")
else:
    print("⚠️  Admin already exists")

# Create test instructor
print("\nCreating Instructor user...")
if not User.objects.filter(email='instructor@test.com').exists():
    instructor = User.objects.create_user(
        email='instructor@test.com',
        password='instructor123',
        first_name='John',
        last_name='Instructor',
        role='INSTRUCTOR'
    )
    print(f"✅ Instructor created: instructor@test.com / instructor123")
else:
    print("⚠️  Instructor already exists")

# Create test student
print("\nCreating Student user...")
if not User.objects.filter(email='student@test.com').exists():
    student = User.objects.create_user(
        email='student@test.com',
        password='student123',
        first_name='Jane',
        last_name='Student',
        role='STUDENT'
    )
    print(f"✅ Student created: student@test.com / student123")
else:
    print("⚠️  Student already exists")

# Create categories
print("\nCreating Categories...")
categories_data = [
    ('Programming', 'Learn programming languages and software development'),
    ('Data Science', 'Master data analysis, machine learning, and AI'),
    ('Web Development', 'Build modern websites and web applications'),
    ('Mobile Development', 'Create iOS and Android mobile apps'),
    ('Design', 'Learn UI/UX design, graphic design, and more'),
    ('Business', 'Business strategy, management, and entrepreneurship'),
    ('Marketing', 'Digital marketing, social media, and branding'),
    ('Photography', 'Photography techniques and photo editing'),
]

for name, description in categories_data:
    category, created = Category.objects.get_or_create(
        name=name,
        defaults={'description': description}
    )
    if created:
        print(f"✅ Category created: {name}")
    else:
        print(f"⚠️  Category already exists: {name}")

print("\n" + "="*60)
print("🎉 Sample data created successfully!")
print("="*60)
print("\nTest Accounts:")
print("-" * 60)
print("Admin:      admin@skillsphere.com / admin123")
print("Instructor: instructor@test.com / instructor123")
print("Student:    student@test.com / student123")
print("-" * 60)
