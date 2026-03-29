from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="MarketTickerSnapshot",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("symbol", models.CharField(db_index=True, max_length=16)),
                ("company", models.CharField(blank=True, max_length=128, null=True)),
                ("price", models.DecimalField(blank=True, decimal_places=4, max_digits=16, null=True)),
                ("change", models.DecimalField(blank=True, decimal_places=4, max_digits=12, null=True)),
                ("change_percent", models.DecimalField(blank=True, decimal_places=4, max_digits=8, null=True)),
                ("volume", models.BigIntegerField(blank=True, null=True)),
                ("source", models.CharField(default="unknown", max_length=32)),
                ("timestamp", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
            ],
            options={
                "ordering": ["-timestamp"],
            },
        ),
        migrations.AddIndex(
            model_name="markettickersnapshot",
            index=models.Index(fields=["symbol", "-timestamp"], name="mts_sym_ts_idx"),
        ),
    ]
