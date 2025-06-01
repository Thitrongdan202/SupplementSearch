# MedicineSearch

## Setup Instructions

1. **Create and Activate Python Environment**
   - Ensure you have Python 3.13 installed.
   - Create a virtual environment:
     ```
     python3.13 -m venv venv
     ```
   - Activate the virtual environment:
     - On macOS/Linux:
       ```
       source venv/bin/activate
       ```
     - On Windows:
       ```
       venv\Scripts\activate
       ```

2. **Install Required Libraries**
   - Install the required libraries using the following command:
     ```
     pip install -r requirements.txt
     ```

3. **Migrate Models**
   - Run the following command to initialize the database:
      ```
      python manage.py migrate
      ```

4. **Initialize Database and Vectorize Data**
   - Run the following command to initialize the database and vectorize data:
      ```
      python vectorize.py
      ```

5. **Setup environment variables**
   - Add gemini key to .env file:
      ```
      GEMINI_KEY="YOUR_GEMINI_KEY"
      ``` 

6. **Run the Project**
   - Start the FastAPI application with the command:
     ```
     python manage.py runserver
     ```

   - Check this link: http://127.0.0.1:8000/search/ 