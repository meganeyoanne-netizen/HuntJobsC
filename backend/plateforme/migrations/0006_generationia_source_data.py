from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("plateforme", "0005_generationia_design")]

    operations = [
        migrations.AddField(
            model_name="generationia",
            name="source_data",
            field=models.JSONField(blank=True, default=dict),
        ),
    ]
