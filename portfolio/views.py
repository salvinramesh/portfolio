# portfolio/views.py
from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import logging
import json
import os
import google.generativeai as genai

from .models import SiteSettings, Service, Project, SocialLink, PersonalItem
from .forms import ContactForm

logger = logging.getLogger(__name__)

def _settings():
    obj = SiteSettings.objects.first()
    if not obj:
        obj = SiteSettings.objects.create()
    return obj


def contact_view(request):
    return home(request)


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
                messages.success(request, "Transmission Received. Handshake Protocol Initiated... We will be in touch.")
            except Exception as exc:
                # Full stack trace in logs
                logger.exception("Failed to send contact email for id=%s: %s", contact_obj.pk, exc)
                # Inform user (message still saved)
                messages.error(request, "Your message was saved but we couldn't send email notifications. We'll look into it.")

            # PRG pattern
            return redirect("/#contact")
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


from django.contrib.admin.views.decorators import staff_member_required

@staff_member_required
def personal(request):
    items = PersonalItem.objects.all()
    return render(request, "personal.html", {
        "settings": _settings(),
        "items": items,
    })


@staff_member_required
def personal_item_detail(request, item_id):
    item = get_object_or_404(PersonalItem, pk=item_id)
    return render(request, "personal_detail.html", {"item": item})


@csrf_exempt
@require_http_methods(["POST"])
def chat_with_ai(request):
    """
    API endpoint for chatbot to communicate with Google Gemini
    """
    try:
        data = json.loads(request.body)
        user_message = data.get('message', '')
        
        if not user_message:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        # Get Gemini API key from environment
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key or api_key == 'your-gemini-api-key-here':
            return JsonResponse({
                'response': "I'm currently not connected to Gemini AI. Please configure the GEMINI_API_KEY in your .env file."
            })
        
        # Configure Gemini
        genai.configure(api_key=api_key)
        
        # Create system message with context about the portfolio
        settings_obj = _settings()
        system_prompt = f"""You are a helpful AI assistant for {settings_obj.site_name}'s portfolio website.
You help visitors learn about the portfolio, services, and projects.
Be friendly, professional, and concise in your responses.
If asked about contact information, mention: salvinramesh@gmail.com
Keep responses under 100 words."""
        
        # Initialize the model with gemini-2.0-flash
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate response with context
        full_prompt = f"{system_prompt}\n\nUser question: {user_message}\n\nYour response:"
        response = model.generate_content(full_prompt)
        
        bot_response = response.text
        
        return JsonResponse({'response': bot_response})
        
    except Exception as e:
        logger.error(f"Chat API error: {str(e)}")
        import traceback
        traceback.print_exc()
        return JsonResponse({
            'response': f"I apologize, but I'm having trouble processing your request. Error: {str(e)}",
            'error_details': str(e)
        }, status=500)

