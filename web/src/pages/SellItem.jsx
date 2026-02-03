import { ArrowLeft, Upload, MapPin, DollarSign } from 'lucide-react';
import { useState } from 'react';

export default function SellItem({ onBack }) {
    const categories = ['Furniture', 'Textbooks', 'Electronics', 'Appliances', 'Clothing', 'Sports & Outdoors', 'Kitchen', 'Room Decor', 'Other'];
    const conditions = ['Brand New', 'Like New', 'Good', 'Fair'];

    const safeZones = [
        { name: 'McConnell Library', details: 'Main Floor Lobby' },
        { name: 'SSMU Building', details: 'Main Entrance' },
        { name: 'Trottier Building', details: 'Lobby' },
        { name: 'Redpath Library', details: 'Ground Floor' },
        { name: 'McLennan Library', details: 'Main Entrance' },
        { name: 'Leacock Building', details: 'Main Entrance' },
        { name: 'Otto Maass Chemistry', details: 'Main Entrance' },
        { name: 'New Residence Hall', details: 'Lobby' },
    ];

    // Smart suggestion based on category
    const suggestedZoneByCategory = {
        'Furniture': 'McConnell Library',
        'Textbooks': 'Redpath Library',
        'Electronics': 'SSMU Building',
        'Appliances': 'New Residence Hall',
        'Clothing': 'Trottier Building',
        'Sports & Outdoors': 'McLennan Library',
        'Kitchen': 'New Residence Hall',
        'Room Decor': 'McConnell Library',
        'Other': 'SSMU Building'
    };

    const [formData, setFormData] = useState({
        title: '',
        price: '',
        category: 'Furniture',
        condition: 'Like New',
        description: '',
        image: null,
        safeZone: 'McConnell Library'  // default matches Furniture suggestion
    });

    const handleInputChange = (field, value) => {
        if (field === 'category') {
            // When category changes, auto-update Safe Zone to suggested one
            setFormData({ ...formData, [field]: value, safeZone: suggestedZoneByCategory[value] });
        } else {
            setFormData({ ...formData, [field]: value });
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
        alert(`Item listed!\nCategory: ${formData.category}\nSafe Zone: ${formData.safeZone}`);
        onBack();
    };

    const selectedZoneDetails = safeZones.find(z => z.name === formData.safeZone);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
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
            <div className="max-w-md lg:max-w-2xl mx-auto px-4 py-6 space-y-4">

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

                {/* Safe Zone Picker */}
                <div className="bg-gradient-to-r from-unicycle-green/10 to-unicycle-blue/10 rounded-lg p-4 border-2 border-unicycle-green/30">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-unicycle-green rounded-lg">
                            <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Pick Your Safe Zone</h3>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                        We suggested <span className="font-semibold text-unicycle-green">{suggestedZoneByCategory[formData.category]}</span> based on your category. Feel free to change it!
                    </p>

                    <select
                        value={formData.safeZone}
                        onChange={(e) => handleInputChange('safeZone', e.target.value)}
                        className="w-full px-3 py-2 border border-unicycle-green/40 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green bg-white"
                    >
                        {safeZones.map(zone => (
                            <option key={zone.name} value={zone.name}>{zone.name} - {zone.details}</option>
                        ))}
                    </select>

                    {selectedZoneDetails && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4 text-unicycle-green" />
                            <span>{selectedZoneDetails.name}, {selectedZoneDetails.details}</span>
                        </div>
                    )}
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