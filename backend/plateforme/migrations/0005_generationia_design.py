from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [("plateforme", "0004_journaladmin")]

    operations = [
        migrations.AddField(
            model_name="generationia",
            name="design",
            field=models.CharField(default="libre", max_length=50),
        ),
    ]
