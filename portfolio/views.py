from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import SiteSettings, Service, Project, SocialLink
from .forms import ContactForm


def _settings():
    obj = SiteSettings.objects.first()
    if not obj:
        obj = SiteSettings.objects.create()
    return obj


def home(request):
    settings_obj = _settings()
    services = Service.objects.all()
    projects = Project.objects.all()[:8]
    socials = SocialLink.objects.all()

    if request.method == "POST":
        form = ContactForm(request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, "Thanks! I'll get back to you soon.")
            return redirect("home")
    else:
        form = ContactForm()

    return render(request, "home.html", {
        "settings": settings_obj,
        "services": services,
        "projects": projects,
        "socials": socials,
        "form": form,
    })


def project_detail(request, pk):
    project = get_object_or_404(Project, pk=pk)
    return render(request, "portfolio_detail.html", {"project": project})
