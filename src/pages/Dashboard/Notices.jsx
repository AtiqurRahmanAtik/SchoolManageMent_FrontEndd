import React, { useState, useEffect } from 'react';
import useNotice from '../../Hook/useNotice'; 

const Notice = () => {
    const {
        notices,
        loading,
        error,
        getAllNotices,
        createNotice,
        updateNotice,
        removeNotice,
    } = useNotice();

    // Form state
    const [formData, setFormData] = useState({
        noticeDetails: '',
        imageUrl: '',
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editId, setEditId] = useState(null);

    // Fetch notices on component mount
    useEffect(() => {
        getAllNotices();
    }, [getAllNotices]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle form submission (Create or Update)
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateNotice(editId, formData);
                setIsEditing(false);
                setEditId(null);
            } else {
                await createNotice(formData);
            }
            // Reset form and refresh list
            setFormData({ noticeDetails: '', imageUrl: '' });
            getAllNotices();
        } catch (err) {
            console.error("Submission failed:", err);
        }
    };

    // Populate form for editing
    const handleEdit = (notice) => {
        setIsEditing(true);
        setEditId(notice._id);
        setFormData({
            noticeDetails: notice.noticeDetails,
            imageUrl: notice.imageUrl || '',
        });
    };

    // Handle deletion
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this notice?")) {
            try {
                await removeNotice(id);
                getAllNotices();
            } catch (err) {
                console.error("Deletion failed:", err);
            }
        }
    };

    // Cancel edit mode
    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditId(null);
        setFormData({ noticeDetails: '', imageUrl: '' });
    };

    return (
        <div className="container mx-auto p-4 md:p-8 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Notice Management</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md h-fit">
                    <h2 className="text-xl font-semibold mb-4 border-b pb-2">
                        {isEditing ? 'Update Notice' : 'Add New Notice'}
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notice Details *</label>
                            <textarea
                                name="noticeDetails"
                                value={formData.noticeDetails}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter notice details"
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                            <input
                                type="url"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="https://example.com/image.jpg"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : (isEditing ? 'Update Notice' : 'Save Notice')}
                            </button>
                            {isEditing && (
                                <button
                                    type="button"
                                    onClick={handleCancelEdit}
                                    className="flex-1 bg-gray-300 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-400 transition"
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* List Section */}
                <div className="lg:col-span-2">
                    <h2 className="text-xl font-semibold mb-4">All Notices</h2>
                    {loading && !notices.length ? (
                        <p className="text-gray-500">Loading notices...</p>
                    ) : notices.length === 0 ? (
                        <p className="text-gray-500 bg-white p-6 rounded-lg shadow-sm">No notices found. Create one to get started.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {notices.map((notice) => (
                                <div key={notice._id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                                    {notice.imageUrl && (
                                        <img 
                                            src={notice.imageUrl} 
                                            alt="Notice" 
                                            className="w-full h-48 object-cover"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    )}
                                    <div className="p-4 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs text-gray-400">
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 text-sm mb-4 flex-1 whitespace-pre-wrap">
                                            {notice.noticeDetails}
                                        </p>
                                        <div className="flex justify-end gap-2 border-t pt-3 mt-auto">
                                            <button
                                                onClick={() => handleEdit(notice)}
                                                className="text-sm px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 transition"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(notice._id)}
                                                className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Notice;