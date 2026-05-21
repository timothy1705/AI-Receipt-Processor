# AI Receipt Auto-Fill Web App

A full-stack web application built for an internship assessment. It allows users to upload receipt images, automatically extracts key data using AI, and populates an editable web form for review.

## Features
* **AI Extraction:** Automatically extracts Merchant Name, Date, Total Amount, and Currency from raw images.
* **Receipt Inspector:** Displays the uploaded image side-by-side with the form for easy visual verification.
* **Local Storage & Export:** Allows users to save reviewed receipts to their browser's local storage and export them as a unified CSV file.

## Tech Stack
* **Frontend:** Next.js (React), Tailwind CSS
* **Backend:** Next.js API Routes (Serverless)
* **AI Model:** Gemini 2.5 Flash

## AI Model & Prompt Strategy
I chose **Google's Gemini 2.5 Flash** because of its native multimodal (vision) capabilities, allowing it to read faded or crumpled receipts instantly without needing a separate OCR processing step. 

**The Prompt & Schema:**
To ensure the frontend could programmatically read the AI's response without formatting errors, I instructed the model to extract the data and enforced a strict JSON schema using the `@google/genai` SDK:
* *"Read this receipt and extract the merchant name, date (DD-MM-YYYY), total amount, and currency."*
* I mapped this to a strict `responseSchema` requiring the exact keys: `merchantName`, `date`, `totalAmount`, and `currency`. This guarantees the AI output flawlessly matches the React frontend state.

## How to Run Locally

1. **Clone the repository** and navigate into the project folder.
2. **Install dependencies:**
   ```bash
   npm run dev
