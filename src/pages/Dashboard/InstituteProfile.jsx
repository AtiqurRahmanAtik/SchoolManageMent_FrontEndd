import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import useInstituteProfile from '../../Hook/useInstituteProfile';
import useAuth from '../../Hook/useAuth';
import Mtitle from '../../components library/Mtitle';
import SkeletonLoader from '../../components/SkeletonLoader';
import Pagination from '../../components/Pagination'; // Adjust path as needed

const InstituteProfileForm = () => {
  // Form states
  const [logoUrl, setLogoUrl] = useState('');
  const [instituteName, setInstituteName] = useState('');
  const [targetLine, setTargetLine] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Error states
  const [errors, setErrors] = useState({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Adjust as needed for card grid

  // Hooks
  const { branch: userBranch } = useAuth();

  const {
    instituteProfiles,
    pagination,
    loading,
    error: hookError,
    fetchInstituteProfilesByBranch, // Changed from fetchAllInstituteProfiles
    createInstituteProfile,
    updateInstituteProfile,
    removeInstituteProfile,
  } = useInstituteProfile();

  // Load profiles for the current branch when page or items per page changes
  useEffect(() => {
    if (userBranch) {
      fetchInstituteProfilesByBranch(userBranch, currentPage, itemsPerPage);
    }
  }, [fetchInstituteProfilesByBranch, userBranch, currentPage, itemsPerPage]);

  // Show hook errors via toast
  useEffect(() => {
    if (hookError) {
      toast.error(hookError);
    }
  }, [hookError]);

  const validateForm = () => {
    const newErrors = {};

    if (!logoUrl.trim()) {
      newErrors.logoUrl = 'Institute logo URL is required';
    }
    if (!instituteName.trim()) {
      newErrors.instituteName = 'Institute name is required';
    }
    if (!targetLine.trim()) {
      newErrors.targetLine = 'Target line is required';
    }
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[\d\s+()-]+$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const formData = {
      instituteLogo: logoUrl,
      nameOfInstitute: instituteName,
      targetLine,
      phoneNumber,
      address,
      branch: userBranch,
    };

    try {
      if (editingId) {
        await updateInstituteProfile(editingId, formData);
        toast.success('Profile updated successfully!');
      } else {
        await createInstituteProfile(formData);
        toast.success('Profile saved successfully!');
      }

      // Refresh list for the current branch and stay on current page
      await fetchInstituteProfilesByBranch(userBranch, currentPage, itemsPerPage);
      
      // Reset form
      setEditingId(null);
      setInstituteName('');
      setTargetLine('');
      setPhoneNumber('');
      setAddress('');
      setLogoUrl('');
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleEdit = (profile) => {
    setInstituteName(profile.nameOfInstitute);
    setTargetLine(profile.targetLine);
    setPhoneNumber(profile.phoneNumber);
    setAddress(profile.address);
    setLogoUrl(profile.instituteLogo);
    setEditingId(profile._id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast.info('Edit mode: Update the form and save.');
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this profile?')) {
      try {
        await removeInstituteProfile(id);
        toast.success('Profile deleted successfully!');
        
        // If current page has only one item and it's not the first page, go to previous page
        if (instituteProfiles.length === 1 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          await fetchInstituteProfilesByBranch(userBranch, currentPage, itemsPerPage);
        }
        
        if (editingId === id) {
          setEditingId(null);
          setInstituteName('');
          setTargetLine('');
          setPhoneNumber('');
          setAddress('');
          setLogoUrl('');
        }
      } catch (err) {
        toast.error(err.message || 'Delete failed');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fbf2] to-[#e8f5e9] py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Main Form Container */}
        <div className="bg-white rounded-3xl shadow-2xl shadow-[#66cc00]/10 overflow-hidden border border-gray-100">
          
          {/* Decorative Header */}
          <div className="relative bg-gradient-to-r from-[#55ab00] to-[#66cc00] px-8 py-10 sm:px-10 overflow-hidden">
            {/* Subtle background blob */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white opacity-10 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">School Profile</h1>
              <p className="text-white/90 mt-2 text-base font-medium">Save and manage your institute information</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 sm:p-10">
            <div className="flex flex-col lg:flex-row gap-10">
              
              {/* Left Column: Logo Section */}
              <div className="lg:w-80 flex-shrink-0">
                <div className="bg-[#fafdf9] rounded-2xl p-6 border border-[#e2f0dd] shadow-sm hover:shadow-md transition-shadow duration-300">
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Institute Logo URL <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={logoUrl}
                    onChange={(e) => {
                      setLogoUrl(e.target.value);
                      if (errors.logoUrl) setErrors(prev => ({ ...prev, logoUrl: '' }));
                    }}
                    placeholder="https://example.com/logo.png"
                    className={`w-full px-4 py-3 bg-white border rounded-xl outline-none transition-all duration-200 ${
                      errors.logoUrl 
                        ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                        : 'border-gray-200 focus:border-[#66cc00] focus:ring-4 focus:ring-[#66cc00]/10'
                    }`}
                  />

                  {logoUrl && (
                    <div className="mt-5 flex justify-center bg-white rounded-xl p-4 border border-dashed border-gray-200">
                      <img 
                        src={logoUrl} 
                        alt="Institute Logo Preview" 
                        className="max-w-full max-h-28 object-contain drop-shadow-sm"
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/100?text=Invalid+URL'; }}
                      />
                    </div>
                  )}

                  {errors.logoUrl && (
                    <p className="text-red-500 text-xs font-medium mt-2">{errors.logoUrl}</p>
                  )}

                  <p className="text-xs text-gray-400 font-medium mt-4 text-center">
                    Provide a valid image URL (PNG, JPG, JPEG)
                  </p>
                </div>
              </div>

              {/* Right Column: Text Inputs */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                  
                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Name of Institute <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={instituteName}
                      onChange={(e) => {
                        setInstituteName(e.target.value);
                        if (errors.instituteName) setErrors(prev => ({ ...prev, instituteName: '' }));
                      }}
                      placeholder="e.g. Springfield High"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white ${
                        errors.instituteName 
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                          : 'border-gray-200 focus:border-[#66cc00] focus:ring-4 focus:ring-[#66cc00]/10'
                      }`}
                    />
                    {errors.instituteName && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.instituteName}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Target Line <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={targetLine}
                      onChange={(e) => {
                        setTargetLine(e.target.value);
                        if (errors.targetLine) setErrors(prev => ({ ...prev, targetLine: '' }));
                      }}
                      placeholder="e.g. Excellence in Education"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white ${
                        errors.targetLine 
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                          : 'border-gray-200 focus:border-[#66cc00] focus:ring-4 focus:ring-[#66cc00]/10'
                      }`}
                    />
                    {errors.targetLine && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.targetLine}</p>
                    )}
                  </div>

                  <div className="col-span-1">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value);
                        if (errors.phoneNumber) setErrors(prev => ({ ...prev, phoneNumber: '' }));
                      }}
                      placeholder="+1 (234) 567-8900"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white ${
                        errors.phoneNumber 
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                          : 'border-gray-200 focus:border-[#66cc00] focus:ring-4 focus:ring-[#66cc00]/10'
                      }`}
                    />
                    {errors.phoneNumber && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) setErrors(prev => ({ ...prev, address: '' }));
                      }}
                      placeholder="Full institute address"
                      rows="3"
                      className={`w-full px-4 py-3 bg-gray-50 border rounded-xl outline-none transition-all duration-200 focus:bg-white resize-none ${
                        errors.address 
                          ? 'border-red-400 focus:ring-2 focus:ring-red-400/20' 
                          : 'border-gray-200 focus:border-[#66cc00] focus:ring-4 focus:ring-[#66cc00]/10'
                      }`}
                    ></textarea>
                    {errors.address && (
                      <p className="text-red-500 text-xs font-medium mt-1">{errors.address}</p>
                    )}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <p className="text-xs font-medium text-gray-400">
                    <span className="text-red-500 text-sm">*</span> Indicates required fields
                  </p>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center justify-center w-full md:w-auto px-8 py-3.5 text-base font-bold text-white bg-gradient-to-r from-[#55ab00] to-[#66cc00] hover:from-[#499300] hover:to-[#5cba00] rounded-xl shadow-lg shadow-[#66cc00]/30 hover:shadow-xl hover:shadow-[#66cc00]/40 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Saving Changes...' : editingId ? 'Update Profile' : 'Save Profile'}
                    {!loading && (
                      <svg className="w-5 h-5 ml-2 -mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                </div>

              </div>
            </div>
          </form>
        </div>

        {/* Institute Profiles List Section */}
        <div className="mt-10 bg-white rounded-3xl shadow-xl shadow-gray-200/50 overflow-hidden p-8 sm:p-10 border border-gray-100">
          <Mtitle title="Saved Profiles" className="mb-6" />
          
          {loading ? (
            <SkeletonLoader />
          ) : instituteProfiles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                {instituteProfiles.map((profile) => (
                  <div key={profile._id} className="group bg-white rounded-2xl shadow-sm hover:shadow-lg border border-gray-100 hover:border-[#66cc00]/40 transition-all duration-300 p-6 flex flex-col justify-between relative overflow-hidden">
                    
                    {/* Hover Decoration Line */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#66cc00] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>

                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-5">
                        {profile.instituteLogo ? (
                          <div className="w-16 h-16 rounded-xl border border-gray-100 p-1.5 flex items-center justify-center bg-gray-50 flex-shrink-0">
                            <img 
                              src={profile.instituteLogo} 
                              alt={profile.nameOfInstitute}
                              className="max-w-full max-h-full object-contain"
                              onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=Logo'; }}
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center flex-shrink-0 text-gray-400">
                            No Logo
                          </div>
                        )}
                        <div>
                          <h2 className="text-xl font-bold text-gray-800 leading-tight">{profile.nameOfInstitute}</h2>
                          <p className="text-sm font-medium text-[#55ab00] mt-1">{profile.targetLine}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-4">
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>{profile.phoneNumber}</span>
                      </div>
                      <div className="flex items-start">
                        <svg className="w-4 h-4 mr-2 mt-0.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        <span>{profile.address}</span>
                      </div>
                    </div>

                    <div className="flex gap-3 mt-5 pt-5 border-t border-gray-100">
                      <button
                        onClick={() => handleEdit(profile)}
                        className="flex-1 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Edit Profile
                      </button>
                      <button
                        onClick={() => handleDelete(profile._id)}
                        className="flex-1 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>
              
              {/* Pagination Controls */}
              {pagination && pagination.totalPages > 1 && (
                <div className="mt-10 flex justify-center">
                  <Pagination
                    currentPage={pagination.currentPage}
                    totalPages={pagination.totalPages}
                    totalItems={pagination.totalItems}
                    itemsPerPage={pagination.itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 px-4 bg-[#fafdf9] rounded-2xl border-2 border-dashed border-[#e2f0dd] mt-6">
              <svg className="mx-auto h-12 w-12 text-[#66cc00] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">No profiles found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new institute profile above.</p>
            </div>
          )}
        </div>

        {/* Footer Policy */}
        <div className="text-center mt-8 text-xs font-medium text-gray-400">
          <p>All information is secure and stored according to our privacy policy.</p>
        </div>
        
      </div>
    </div>
  );
};

export default InstituteProfileForm;