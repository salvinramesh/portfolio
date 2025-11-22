# portfolio/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
import logging

from .models import SiteSettings, Service, Project, SocialLink
from .forms import ContactForm

logger = logging.getLogger(__name__)

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
            contact_obj = form.save()  # Save to DB first

            # Prepare email content
            subject = f"New contact message: {contact_obj.subject or 'No subject'}"
            context = {"msg": contact_obj}
            text_body = render_to_string("email/contact_email.txt", context)
            html_body = render_to_string("email/contact_email.html", context)

            try:
                email = EmailMultiAlternatives(
                    subject=subject,
                    body=text_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    to=[settings.CONTACT_RECIPIENT_EMAIL],
                )
                email.attach_alternative(html_body, "text/html")
                sent = email.send(fail_silently=False)  # will raise on error
                logger.info("Contact email sent (count=%s) for ContactMessage id=%s", sent, contact_obj.pk)
                messages.success(request, "Thanks! I'll get back to you soon.")
            except Exception as exc:
                # Full stack trace in logs
                logger.exception("Failed to send contact email for id=%s: %s", contact_obj.pk, exc)
                # Inform user (message still saved)
                messages.error(request, "Your message was saved but we couldn't send email notifications. We'll look into it.")

            # PRG pattern
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
