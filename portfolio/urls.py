from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
path("", views.home, name="home"),
path("project/<int:pk>/", views.project_detail, name="project_detail"),
    path('personal/', views.personal, name='personal'),
    path('personal/<int:item_id>/', views.personal_item_detail, name='personal_item_detail'),
    path('contact/', views.contact_view, name='contact'),
    path('api/chat/', views.chat_with_ai, name='chat_with_ai'),
    path('dashboard-choice/', views.dashboard_choice, name='dashboard_choice'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)