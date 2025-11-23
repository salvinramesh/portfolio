from django.db import models

class TimeStamped(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class SiteSettings(TimeStamped):
    site_name = models.CharField(max_length=120, default="IT Engineer Portfolio")
    logo = models.ImageField(upload_to="branding/", blank=True, null=True)
    navbar_logo = models.ImageField(upload_to="branding/", blank=True, null=True, help_text="Separate logo for the navigation bar")

    # HERO (dynamic)
    hero_kicker = models.CharField(max_length=80, blank=True, help_text="Small label above the title, e.g., 'DevOps • Cloud • Networking'")
    hero_heading = models.CharField(max_length=160, default="IT Engineer's Portfolio")
    hero_subheading = models.CharField(max_length=255, blank=True)
    hero_cta_text = models.CharField(max_length=60, default="See more about me")
    hero_cta_url = models.CharField(max_length=200, default="#about")
    hero_bg_image = models.ImageField(upload_to="hero/", blank=True, null=True)
    hero_bg_darkness = models.FloatField(
        default=0.55, help_text="0 = none, 0.85 = very dark overlay"
    )
    # New: right-side visual beside the heading
    hero_side_image = models.ImageField(upload_to="hero/", blank=True, null=True)

    # ABOUT
    about_title = models.CharField(max_length=120, default="About Me")
    about_summary = models.TextField(blank=True)
    resume_file = models.FileField(upload_to="docs/", blank=True, null=True)

    class Meta:
        verbose_name = "Site Settings (single row)"

    def __str__(self):
        return self.site_name


class Service(TimeStamped):
    title = models.CharField(max_length=120)
    description = models.TextField()
    icon_class = models.CharField(max_length=64, blank=True, help_text="Icon CSS class")
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["order", "id"]

    def __str__(self):
        return self.title


class ProjectCategory(models.Model):
    name = models.CharField(max_length=60)

    def __str__(self):
        return self.name


class Project(TimeStamped):
    title = models.CharField(max_length=150)
    category = models.ForeignKey(
        ProjectCategory, on_delete=models.SET_NULL, null=True, blank=True
    )
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to="projects/")
    github_url = models.URLField(blank=True)
    live_url = models.URLField(blank=True)
    highlight = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return self.title


class SocialLink(models.Model):
    name = models.CharField(max_length=40)
    url = models.URLField()
    icon_class = models.CharField(max_length=64, blank=True)

    def __str__(self):
        return self.name


class ContactMessage(TimeStamped):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=150)
    message = models.TextField()

    def __str__(self):
        return f"{self.name} — {self.subject}"


class PersonalItem(TimeStamped):
    CATEGORY_CHOICES = [
        ('IDs', 'IDs'),
        ('Docs', 'Docs'),
        ('Photos', 'Photos'),
        ('Others', 'Others'),
    ]
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    title = models.CharField(max_length=150)
    text_content = models.TextField(blank=True, help_text="For IDs (number) or Others (notes)")
    file = models.FileField(upload_to="personal_docs/", blank=True, null=True, help_text="For Docs")
    # Keeping 'image' for backward compatibility or single cover image, but new images will go to PersonalItemImage
    image = models.ImageField(upload_to="personal_photos/", blank=True, null=True, help_text="For Photos or primary ID image")

    class Meta:
        ordering = ["-created"]

    def __str__(self):
        return f"[{self.category}] {self.title}"


class PersonalItemImage(models.Model):
    item = models.ForeignKey(PersonalItem, related_name='images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to="personal_photos/gallery/")
    caption = models.CharField(max_length=200, blank=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.item.title}"
