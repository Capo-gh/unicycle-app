import { ArrowLeft, Upload, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function SellItem({ onBack }) {
    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Furniture',
        condition: 'Like New',
        description: '',
        image: null
    });

    const [suggestedSafeZone, setSuggestedSafeZone] = useState('McConnell Library');

    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Other'];
    const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

    // Safe zones based on category (smart recommendation!)
    const safeZonesByCategory = {
        'Textbooks': 'Redpath Library',
        'Electronics': 'SSMU Building',
        'Furniture': 'McConnell Library',
        'Appliances': 'New Residence Hall Lobby',
        'Clothing': 'University Centre',
        'Other': 'McLennan Library'
    };

    const handleInputChange = (field, value) => {
        setFormData({ ...formData, [field]: value });

        // Auto-suggest Safe Zone based on category
        if (field === 'category') {
            setSuggestedSafeZone(safeZonesByCategory[value]);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, image: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = () => {
        // In real app, this would send to backend
        alert(`Item listed! Safe Zone: ${suggestedSafeZone}`);
        onBack();
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">List an Item</h1>
                    <div className="w-10"></div>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-md mx-auto px-4 py-6 space-y-4">

                {/* Image Upload */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-3">Photos</label>

                    {formData.image ? (
                        <div className="relative">
                            <img
                                src={formData.image}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            <button
                                onClick={() => setFormData({ ...formData, image: null })}
                                className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-unicycle-green transition-colors">
                            <Upload className="w-12 h-12 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">Upload photo</span>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </label>
                    )}
                </div>

                {/* Title */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Title</label>
                    <input
                        type="text"
                        placeholder="e.g., IKEA Desk - Perfect Condition"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                    />
                </div>

                {/* Category & Condition */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => handleInputChange('category', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Condition</label>
                        <select
                            value={formData.condition}
                            onChange={(e) => handleInputChange('condition', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        >
                            {conditions.map(cond => (
                                <option key={cond} value={cond}>{cond}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Price */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Price (CAD)</label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="number"
                            placeholder="45"
                            value={formData.price}
                            onChange={(e) => handleInputChange('price', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>
                    {formData.price >= 50 && (
                        <p className="text-xs text-unicycle-blue mt-2">
                            ✓ Qualifies for Secure-Pay escrow protection
                        </p>
                    )}
                </div>

                {/* Description */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                    <textarea
                        placeholder="Describe the item, condition, reason for selling..."
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                    />
                </div>

                {/* Auto-Suggested Safe Zone - KEY FEATURE! */}
                <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border-2 border-unicycle-green/30">
                    <div className="flex items-start gap-3">
                        <div className="p-2 bg-unicycle-green rounded-lg">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">Recommended Safe Zone</h3>
                            <p className="text-sm font-medium text-gray-900 mb-1">{suggestedSafeZone}</p>
                            <p className="text-xs text-gray-600">
                                Based on your item category, we recommend this Safe Zone for meetups. You can discuss alternatives with the buyer.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    onClick={handleSubmit}
                    disabled={!formData.title || !formData.price || !formData.image}
                    className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    List Item
                </button>
            </div>
        </div>
    );
}