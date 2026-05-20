import { GoogleGenAI, Type } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const base64Data = body.image.split(",")[1];
        const mimeType = body.image.substring(body.image.indexOf(":") + 1, body.image.indexOf(";"));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                "Read this receipt and extract the merchant name, date (DD-MM-YYYY), total amount, and currency.",
                { inlineData: { data: base64Data, mimeType: mimeType } }
            ],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        merchantName: { type: Type.STRING },
                        date: { type: Type.STRING },
                        totalAmount: { type: Type.STRING },
                        currency: { type: Type.STRING }
                    },
                    required: ["merchantName", "date", "totalAmount", "currency"]
                }
            }
        });

        if (!response.text) throw new Error("No text returned");

        return NextResponse.json({ data: JSON.parse(response.text) });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to extract" }, { status: 500 });
    }
}