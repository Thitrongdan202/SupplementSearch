from django.db import models

# Create your models here.
class MedicinesDetail(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    composition = models.TextField()
    uses = models.TextField()
    side_effects = models.TextField()
    image_url = models.URLField(max_length=255)
    manufacturer = models.CharField(max_length=255)
    excellent_review = models.FloatField()
    average_review = models.FloatField()
    poor_review = models.FloatField()
    text = models.TextField()
    embedding = models.BinaryField()

    def __str__(self):
        return self.name
    
    class Meta:
        db_table = 'medicines_detail'
        verbose_name = 'Medicines Detail'
        verbose_name_plural = 'Medicines Details'