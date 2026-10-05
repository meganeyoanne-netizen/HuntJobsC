from django.contrib import admin
from .models import Notification, Entretien, Alerte, Message, Parametre, GenerationIA
for model in [Notification, Entretien, Alerte, Message, Parametre, GenerationIA]:
    admin.site.register(model)

from .models import JournalAdmin

@admin.register(JournalAdmin)
class JournalAdminView(admin.ModelAdmin):
    list_display = ["acteur","cible_type","cible_id","action","created_at"]
    list_filter = ["cible_type","action"]
    readonly_fields = ["acteur","cible_type","cible_id","action","motif","created_at"]
    def has_add_permission(self,request): return False
    def has_change_permission(self,request,obj=None): return False
    def has_delete_permission(self,request,obj=None): return False
