from django.contrib import admin
from .models import SiteSettings, Service, Project, ProjectCategory, SocialLink, ContactMessage, PersonalItem, PersonalItemImage
from .forms import PersonalItemForm

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    list_display = ("site_name", "updated")


@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
    list_display = ("title", "order")
    list_editable = ("order",)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ("title", "category", "highlight", "created")
    list_filter = ("category", "highlight")
    search_fields = ("title", "description")
    list_editable = ("highlight",)


@admin.register(ProjectCategory)
class ProjectCategoryAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("name", "url")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "subject", "created")
    readonly_fields = ("name", "email", "subject", "message", "created")


class PersonalItemImageInline(admin.TabularInline):
    model = PersonalItemImage
    extra = 1


@admin.register(PersonalItem)
class PersonalItemAdmin(admin.ModelAdmin):
    form = PersonalItemForm
    list_display = ("title", "category", "created")
    list_filter = ("category",)
    search_fields = ("title", "text_content")
    inlines = [PersonalItemImageInline]

    class Media:
        js = ('admin/js/personal_item_admin.js',)

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if request.FILES:
            for f in request.FILES.getlist('multiple_images'):
                PersonalItemImage.objects.create(item=obj, image=f)
