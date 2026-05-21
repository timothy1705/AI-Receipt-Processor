"use client";
import { useState, useEffect } from "react";

export default function Home() {
    const [loading, setLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [savedReceipts, setSavedReceipts] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        merchantName: "",
        date: "",
        totalAmount: "",
        currency: "",
    });

    useEffect(() => {
        const saved = localStorage.getItem("savedReceiptsList");
        if (saved) setSavedReceipts(JSON.parse(saved));
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            const base64Data = reader.result as string;
            setImagePreview(base64Data);

            try {
                console.log("1. Sending image to backend...");

                const response = await fetch("/api/extract", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ image: base64Data }),
                });

                console.log("2. Backend responded with status:", response.status);

                const result = await response.json();
                console.log("3. Data received from backend:", result);

                if (!response.ok) {
                    // This will pop up on your screen if the backend fails!
                    alert(`Backend Error: ${result.error || 'Something went wrong on the server'}`);
                    setLoading(false);
                    return;
                }

                if (result.data) {
                    console.log("4. Auto-filling form!");
                    setFormData({
                        merchantName: result.data.merchantName || "",
                        date: result.data.date || "",
                        totalAmount: result.data.totalAmount || "",
                        currency: result.data.currency || "",
                    });
                } else {
                    alert("The AI returned a response, but the data was empty.");
                }
            } catch (error) {
                console.error("Critical Network Error:", error);
                alert("Failed to connect to the backend completely.");
            } finally {
                setLoading(false);
            }
        };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedReceipts = [...savedReceipts, formData];
        setSavedReceipts(updatedReceipts);
        localStorage.setItem("savedReceiptsList", JSON.stringify(updatedReceipts));
        alert("Receipt saved!");
        setFormData({ merchantName: "", date: "", totalAmount: "", currency: "" });
        setImagePreview(null);
    };

    const exportToCSV = () => {
        if (savedReceipts.length === 0) return alert("No receipts to export!");
        const headers = ["Merchant name,Date,Total amount,Currency\n"];
        const csvRows = savedReceipts.map(r => `"${r.merchantName}","${r.date}","${r.totalAmount}","${r.currency}"`);
        const blob = new Blob([headers.concat(csvRows).join("\n")], { type: 'text/csv' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "Extracted_Receipts.csv";
        link.click();
    };

    const handleDeleteReceipt = (indexToRemove: number) => {
        const updatedReceipts = savedReceipts.filter((_, index) => index !== indexToRemove);
        setSavedReceipts(updatedReceipts);
        localStorage.setItem("savedReceiptsList", JSON.stringify(updatedReceipts));
    };

    const handleClearAll = () => {
        if (savedReceipts.length === 0) return;
        const confirmDelete = window.confirm("Are you sure you want to delete all saved receipts?");
        if (confirmDelete) {
            setSavedReceipts([]);
            localStorage.setItem("savedReceiptsList", JSON.stringify([]));
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 p-8 text-gray-900">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-center text-blue-900">AI Receipt Auto-Fill</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="bg-white p-6 rounded-xl shadow-sm border h-fit">
                        <h2 className="text-xl font-semibold mb-4 border-b pb-2">1. Upload Receipt</h2>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="w-full border-2 border-dashed p-6 text-center rounded-lg cursor-pointer mb-4" />
                        {loading && <div className="p-4 bg-blue-50 text-blue-700 rounded-lg text-center animate-pulse mb-4">Reading receipt...</div>}
                        {imagePreview && <img src={imagePreview} className="w-full rounded-lg shadow-sm border" />}
                    </div>

                    <div className="space-y-6">
                        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="text-xl font-semibold mb-4 border-b pb-2">2. Review Fields</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Merchant name</label>
                                    <input type="text" value={formData.merchantName} onChange={e => setFormData({ ...formData, merchantName: e.target.value })} className="w-full border p-2.5 rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date</label>
                                    <input type="text" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full border p-2.5 rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Total amount</label>
                                    <input type="text" value={formData.totalAmount} onChange={e => setFormData({ ...formData, totalAmount: e.target.value })} className="w-full border p-2.5 rounded-md" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Currency</label>
                                    <input type="text" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })} className="w-full border p-2.5 rounded-md" required />
                                </div>
                                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md mt-4">Save Data</button>
                            </div>
                        </form>

                        <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center">
                            <p><strong>{savedReceipts.length}</strong> saved.</p>
                            <button onClick={exportToCSV} className="bg-emerald-600 text-white px-4 py-2 rounded-md">Download CSV</button>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}