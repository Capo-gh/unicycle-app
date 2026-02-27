import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, DollarSign, Save, X, Image, Tag } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import { updateListing, markAsSold, markAsUnsold } from '../api/listings';
import { uploadImage } from '../api/upload';
import { getSafeZones } from '../constants/safeZones';

export default function EditListing({ listing, onBack, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        condition: '',
        price: '',
        description: '',
        safeZone: '',
        safeZoneAddress: ''
    });
    const [images, setImages] = useState([]);
    const [isSold, setIsSold] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const categories = [
        'Free',
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

    const isFree = formData.category === 'Free';

    const conditions = ['New', 'Like New', 'Good', 'Fair'];

    const userUniversity = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}').university || '';
        } catch { return ''; }
    })();
    const safeZones = getSafeZones(userUniversity);

    // Pre-fill form with existing listing data
    useEffect(() => {
        if (listing) {
            setFormData({
                title: listing.title || '',
                category: listing.category || '',
                condition: listing.condition || '',
                price: listing.price?.toString() || '',
                description: listing.description || '',
                safeZone: listing.safe_zone || listing.safeZone || '',
                safeZoneAddress: listing.safe_zone_address || listing.safeZoneAddress || ''
            });
            // Initialize images from existing listing
            if (listing.images) {
                setImages(listing.images.split(',').filter(Boolean));
            }
            setIsSold(!!listing.is_sold);
        }
    }, [listing]);

    const compressAndUpload = async (file) => {
        let fileToUpload = file;
        if (file.type.startsWith('image/') && file.size > 500 * 1024) {
            fileToUpload = await imageCompression(file, {
                maxSizeMB: 1,
                maxWidthOrHeight: 1920,
                useWebWorker: true,
            });
        }
        return await uploadImage(fileToUpload);
    };

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }
        setUploading(true);
        setError('');
        try {
            for (const file of files) {
                const url = await compressAndUpload(file);
                setImages(prev => [...prev, url]);
            }
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === 'category' && value === 'Free') {
                updated.price = '0';
            }
            return updated;
        });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.title || !formData.category || !formData.condition ||
            !formData.description || !formData.safeZone) {
            setError('Please fill in all fields');
            return;
        }

        if (!isFree && (formData.price === '' || parseFloat(formData.price) < 0)) {
            setError('Price must be 0 or more');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const updateData = {
                title: formData.title,
                description: formData.description,
                price: isFree ? 0 : parseFloat(formData.price),
                category: formData.category,
                condition: formData.condition,
                safe_zone: formData.safeZone,
                safe_zone_address: formData.safeZoneAddress,
                images: images.join(',')
            };

            await updateListing(listing.id, updateData);

            // Handle sold status change separately
            if (isSold !== !!listing.is_sold) {
                if (isSold) {
                    await markAsSold(listing.id);
                } else {
                    await markAsUnsold(listing.id);
                }
            }

            setSuccess(true);

            // Redirect after 1.5 seconds
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                } else {
                    onBack();
                }
            }, 1500);

        } catch (err) {
            console.error('Error updating listing:', err);
            if (err.response?.status === 403) {
                setError('You can only edit your own listings');
            } else if (err.response?.data?.detail) {
                setError(Array.isArray(err.response.data.detail)
                    ? err.response.data.detail[0].msg
                    : err.response.data.detail);
            } else {
                setError('Failed to update listing. Please try again.');
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
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Changes Saved! ✨</h2>
                    <p className="text-gray-600">Your listing has been updated</p>
                </div>
            </div>
        );
    }

    if (!listing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="text-center">
                    <p className="text-gray-600">No listing selected</p>
                    <button
                        onClick={onBack}
                        className="mt-4 text-unicycle-blue hover:underline"
                    >
                        Go back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-14 lg:top-0 z-10">
                <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-700" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">Edit Listing</h1>
                </div>
            </div>

            {/* Form */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Photos */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <label className="text-sm font-semibold text-gray-900">Photos *</label>
                            <span className={`text-sm font-medium ${images.length >= 5 ? 'text-red-600' : 'text-gray-500'}`}>
                                {images.length}/5 images
                            </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-2">
                            {images.map((url, index) => (
                                <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                    <img src={url} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            {images.length < 5 && (
                                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-unicycle-green hover:bg-gray-50 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden"
                                        disabled={uploading}
                                    />
                                    {uploading ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-unicycle-green" />
                                    ) : (
                                        <>
                                            <Image className="w-6 h-6 text-gray-400 mb-1" />
                                            <span className="text-xs text-gray-500">Add</span>
                                        </>
                                    )}
                                </label>
                            )}
                        </div>
                        {images.length === 0 && (
                            <p className="text-xs text-amber-600">At least one photo is required</p>
                        )}
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
                    {isFree ? (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm font-semibold text-green-800">Price: Free</p>
                            <p className="text-xs text-green-600 mt-0.5">This item will be listed for free</p>
                        </div>
                    ) : (
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
                    )}

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

                    {/* Sold Status */}
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-gray-600" />
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">Mark as Sold</p>
                                    <p className="text-xs text-gray-500">Sold items are hidden from the marketplace</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsSold(prev => !prev)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isSold ? 'bg-unicycle-green' : 'bg-gray-200'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isSold ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
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
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-5 h-5" />
                                Save Changes
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}