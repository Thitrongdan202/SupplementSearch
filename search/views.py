from django.shortcuts import render

# Create your views here.
from django.shortcuts import render
from django.views import View

from .models import MedicinesDetail
from .search_engine import MedicineSearchEngine

class MedicationSearchView(View):
    """Search for medications by text query or image upload.
    """

    template_name = "medication_search.html"

    def get(self, request):
        """Display the empty search page."""
        return render(request, self.template_name, {
            "page_title": "Tìm Kiếm Thuốc",
            "medications": [],
            "labels": [],
        })

    def post(self, request):
        """Handle text search and (optionally) image‑based search in the same form."""
        query: str = request.POST.get("q", "").strip()
        image_file = request.FILES.get("image")
        medications = []
        labels: list[str] = []

        # --- Text‑based search -------------------------------------------------
        if query:
            search_engine = MedicineSearchEngine()
            medications.extend(search_engine.search_with_llm(query, top_k=12))
            labels.append(f"Kết quả cho từ khoá \"{query}\"")

        # --- Image‑based search -----------------------------------------------
        if image_file:
            # TODO: Replace this stub with your ML model / OCR
            detected_name = self._fake_image_recognizer(image_file)
            if detected_name:
                medications = medications | MedicinesDetail.objects.filter(name__icontains=detected_name)
                labels.append(f"Kết quả từ ảnh (phát hiện: {detected_name})")
        print(medications)
        return render(request, self.template_name, {
            "page_title": "Kết quả Tìm Kiếm Thuốc",
            "medications": medications,
            "labels": labels,
        })

    # -------------------------------------------------------------------------
    # 🧪 Stub helper: demo image recognizer   
    # -------------------------------------------------------------------------
    def _fake_image_recognizer(self, image_file):
        """Placeholder that always returns 'Paracetamol'.

        Replace with your own Vision / OCR inference logic.
        """
        return "Paracetamol"

