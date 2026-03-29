from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("prediction", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="HistoricalPriceSeries",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("symbol", models.CharField(db_index=True, max_length=32)),
                ("interval", models.CharField(db_index=True, default="1day", max_length=16)),
                ("start_date", models.DateField()),
                ("end_date", models.DateField()),
                ("data", models.JSONField()),
                ("source", models.CharField(default="twelvedata", max_length=32)),
                ("fetched_at", models.DateTimeField(db_index=True, default=django.utils.timezone.now)),
            ],
            options={
                "ordering": ["-fetched_at"],
                "unique_together": {("symbol", "interval")},
            },
        ),
        migrations.AddIndex(
            model_name="historicalpriceseries",
            index=models.Index(fields=["symbol", "interval", "-fetched_at"], name="hps_sym_int_idx"),
        ),
    ]
