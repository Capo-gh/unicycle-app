import { useState } from 'react';
import { ArrowLeft, Upload, MapPin, DollarSign, X, Image as ImageIcon } from 'lucide-react';
import { createListing } from '../api/listings';
import { uploadImage } from '../api/upload';

export default function SellItem({ onBack }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        condition: '',
        price: '',
        description: '',
        safeZone: '',
        safeZoneAddress: ''
    });
    const [images, setImages] = useState([]); // Array of { file, preview, url, uploading }
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const categories = [
        'Textbooks & Course Materials',
        'Electronics & Gadgets',
        'Furniture & Decor',
        'Clothing & Accessories',
        'Sports & Fitness',
        'Kitchen & Dining',
        'School Supplies',
        'Bikes & Transportation',
        'Other'
    ];

    const conditions = ['New', 'Like New', 'Good', 'Fair'];

    const safeZones = [
        { name: 'McConnell Library', address: '3459 McTavish St, Main Floor Lobby' },
        { name: 'Redpath Library', address: '3461 McTavish St, Front Entrance' },
        { name: 'Leacock Building', address: '855 Sherbrooke St W, Main Entrance' },
        { name: 'Shatner University Centre', address: '3480 McTavish St, Main Floor' },
        { name: 'Trottier Building', address: '3630 University St, Lobby' }
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSafeZoneSelect = (e) => {
        const zone = safeZones.find(z => z.name === e.target.value);
        if (zone) {
            setFormData(prev => ({
                ...prev,
                safeZone: zone.name,
                safeZoneAddress: zone.address
            }));
        }
    };

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files);

        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newImages = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            url: null,
            uploading: false
        }));

        setImages(prev => [...prev, ...newImages]);
        setError('');
    };

    const removeImage = (index) => {
        setImages(prev => {
            const newImages = [...prev];
            // Revoke object URL to free memory
            if (newImages[index].preview) {
                URL.revokeObjectURL(newImages[index].preview);
            }
            newImages.splice(index, 1);
            return newImages;
        });
    };

    const uploadAllImages = async () => {
        const uploadedUrls = [];

        for (let i = 0; i < images.length; i++) {
            const img = images[i];

            if (img.url) {
                // Already uploaded
                uploadedUrls.push(img.url);
                continue;
            }

            // Update uploading state
            setImages(prev => {
                const newImages = [...prev];
                newImages[i] = { ...newImages[i], uploading: true };
                return newImages;
            });

            try {
                const result = await uploadImage(img.file);
                uploadedUrls.push(result.url);

                // Update with URL
                setImages(prev => {
                    const newImages = [...prev];
                    newImages[i] = { ...newImages[i], url: result.url, uploading: false };
                    return newImages;
                });
            } catch (err) {
                console.error('Failed to upload image:', err);
                throw new Error('Failed to upload images. Please try again.');
            }
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.category || !formData.condition ||
            !formData.price || !formData.description || !formData.safeZone) {
            setError('Please fill in all fields');
            return;
        }

        if (parseFloat(formData.price) <= 0) {
            setError('Price must be greater than 0');
            return;
        }

        if (images.length === 0) {
            setError('Please add at least one image');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Upload all images first
            const imageUrls = await uploadAllImages();

            const listingData = {
                title: formData.title,
                description: formData.description,
                price: parseFloat(formData.price),
                category: formData.category,
                condition: formData.condition,
                safe_zone: formData.safeZone,
                safe_zone_address: formData.safeZoneAddress,
                images: imageUrls.join(',')  // Comma-separated URLs
            };

            const result = await createListing(listingData);
            console.log('Listing created:', result);
            setSuccess(true);

            // Redirect after 2 seconds
            setTimeout(() => {
                onBack();
            }, 2000);

        } catch (err) {
            console.error('Error creating listing:', err);
            if (err.message) {
                setError(err.message);
            } else if (err.response?.data?.detail) {
                setError(Array.isArray(err.response.data.detail)
                    ? err.response.data.detail[0].msg
                    : err.response.data.detail);
            } else {
                setError('Failed to create listing. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Item Posted! 🎉</h2>
                    <p className="text-gray-600">Your listing is now live on the marketplace</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Sell an Item</h1>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Image Upload */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                            Photos * <span className="font-normal text-gray-500">({images.length}/5)</span>
                        </label>

                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                            {/* Existing Images */}
                            {images.map((img, index) => (
                                <div key={index} className="relative aspect-square">
                                    <img
                                        src={img.preview}
                                        alt={`Preview ${index + 1}`}
                                        className="w-full h-full object-cover rounded-lg"
                                    />
                                    {img.uploading && (
                                        <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {!img.uploading && (
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                    {index === 0 && (
                                        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-black/70 text-white text-xs rounded">
                                            Main
                                        </span>
                                    )}
                                </div>
                            ))}

                            {/* Add Image Button */}
                            {images.length < 5 && (
                                <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-unicycle-green hover:bg-unicycle-green/5 transition-colors">
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-1" />
                                    <span className="text-xs text-gray-500">Add Photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                        multiple
                                        className="hidden"
                                    />
                                </label>
                            )}
                        </div>

                        <p className="text-xs text-gray-500 mt-3">
                            First image will be the cover. Max 5 images, 10MB each.
                        </p>
                    </div>

                    {/* Title */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g., IKEA Desk - Perfect Condition"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                        />
                    </div>

                    {/* Category & Condition */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            >
                                <option value="">Select category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div className="bg-white rounded-lg p-6 shadow-sm">
                            <label className="block text-sm font-semibold text-gray-900 mb-2">Condition *</label>
                            <select
                                name="condition"
                                value={formData.condition}
                                onChange={handleChange}
                                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            >
                                <option value="">Select condition</option>
                                {conditions.map(cond => (
                                    <option key={cond} value={cond}>{cond}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Price *</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="0.00"
                                step="0.01"
                                min="0"
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <label className="block text-sm font-semibold text-gray-900 mb-2">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your item, its condition, any flaws, etc."
                            rows="4"
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green resize-none"
                        />
                    </div>

                    {/* Safe Zone */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center gap-2 mb-3">
                            <MapPin className="w-5 h-5 text-unicycle-green" />
                            <label className="text-sm font-semibold text-gray-900">Meeting Location (Safe Zone) *</label>
                        </div>
                        <select
                            value={formData.safeZone}
                            onChange={handleSafeZoneSelect}
                            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-unicycle-green mb-2"
                        >
                            <option value="">Select a safe zone</option>
                            {safeZones.map(zone => (
                                <option key={zone.name} value={zone.name}>{zone.name}</option>
                            ))}
                        </select>
                        {formData.safeZoneAddress && (
                            <p className="text-sm text-gray-600">{formData.safeZoneAddress}</p>
                        )}
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-unicycle-green text-white py-3 rounded-lg font-semibold hover:bg-unicycle-green/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Posting...
                            </>
                        ) : (
                            'Post Item'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}