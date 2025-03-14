from fastapi import FastAPI
from google.cloud import firestore

app = FastAPI()

# init firestore client
# db = firestore.Client()

@app.get("/")
async def root():
    return {"message": "FastAPI Server running"}