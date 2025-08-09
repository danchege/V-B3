import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { api, handleApiError } from '../utils/api';

// Function to get coordinates from city and country using OpenStreetMap Nominatim API
const getCoordinates = async (city, country) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        `${city}, ${country}`
      )}&limit=1`
    );
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        type: 'Point',
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    }
    return null;
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
};

const ProfileSetup = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    bio: '',
    gender: '',
    interests: [],
    photos: [],
    location: {
      city: '',
      country: ''
    },
    preferences: {
      ageRange: { min: 18, max: 99 },
      distance: 50,
      gender: []
    }
  });
  const [newPhoto, setNewPhoto] = useState('');
  const [newInterest, setNewInterest] = useState('');

  // Fetch user profile data if editing
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        console.log('Fetching user profile...');
        const token = localStorage.getItem('token');
        console.log('Using token for profile fetch:', token ? 'Token exists' : 'No token found');
        
        // Use the correct endpoint path
        const response = await api.get('/users/me');
        console.log('Profile API response:', response.data);
        
        if (response.data && response.data.data) {
          const userData = response.data.data;
          console.log('Profile data received:', userData);
          
          setFormData(prev => ({
            name: userData.name || '',
            age: userData.age || '',
            bio: userData.bio || '',
            gender: userData.gender || '',
            interests: userData.interests || [],
            photos: userData.photos || [],
            location: userData.location || {
              type: 'Point',
              coordinates: [0, 0]
            },
            preferences: userData.preferences || {
              ageRange: { min: 18, max: 99 },
              distance: 50,
              gender: []
            }
          }));
        }
      } catch (error) {
        const apiError = handleApiError(error);
        console.error('Error in fetchProfile:', apiError);
        
        // Set appropriate error message based on the error
        let errorMessage = apiError.message || 'Failed to load profile. Please try again.';
        
        // If it's a 401, the interceptor will handle the redirect
        if (apiError.status === 401) {
          return; // Interceptor will handle the redirect
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (name.startsWith('preferences.')) {
      // Handle preferences specifically
      const prefKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          [prefKey]: prefKey === 'gender' ? 
            Array.isArray(value) ? value : [value] : 
            value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'age' ? parseInt(value, 10) || '' : value
      }));
    }
  };

  const handleAddPhoto = (e) => {
    e.preventDefault();
    if (newPhoto && !formData.photos.includes(newPhoto)) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, newPhoto]
      }));
      setNewPhoto('');
    }
  };

  const handleRemovePhoto = (photoToRemove) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(photo => photo !== photoToRemove)
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    const interest = newInterest.trim();
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setNewInterest('');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(interest => interest !== interestToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Basic validation
    if (!formData.name || !formData.age || !formData.gender || !formData.location.city || !formData.location.country) {
      setError('Please fill in all required fields including location');
      setIsSubmitting(false);
      return;
    }

    // Add geocoding for location
    try {
      const coordinates = await getCoordinates(formData.location.city, formData.location.country);
      if (!coordinates) {
        throw new Error('Could not find coordinates for the provided location. Please check the city and country names.');
      }

      // Update form data with coordinates
      const updatedFormData = {
        ...formData,
        location: {
          ...formData.location,
          type: 'Point',
          coordinates: coordinates.coordinates
        },
        // Ensure preferences.gender is an array for the backend
        preferences: {
          ...formData.preferences,
          gender: Array.isArray(formData.preferences.gender) 
            ? formData.preferences.gender 
            : [formData.preferences.gender].filter(Boolean)
        }
      };

      const { data } = await api.put('/users/me', updatedFormData);
      
      // Update auth context with new user data
      if (updateUser) {
        updateUser(data.data);
      }
      
      // Redirect to home or profile page
      navigate('/swipe');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink via-loveRed to-maroon flex flex-col">
      <Navbar />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 md:p-8">
            <h1 className="text-3xl font-bold text-maroon mb-6">
              {user?.profileComplete ? 'Edit Profile' : 'Complete Your Profile'}
            </h1>
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Basic Information</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Age *</label>
                    <input
                      type="number"
                      name="age"
                      min="18"
                      max="120"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="non-binary">Non-binary</option>
                      <option value="prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    maxLength="500"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                    placeholder="Tell others about yourself..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{formData.bio?.length || 0}/500 characters</p>
                </div>
              </section>

              {/* Photos Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Photos</h2>
                
                <div className="flex flex-wrap gap-4 mb-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={photo} 
                        alt={`Profile ${index + 1}`}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(photo)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newPhoto}
                    onChange={(e) => setNewPhoto(e.target.value)}
                    placeholder="Paste photo URL"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                  />
                  <Button 
                    type="button"
                    onClick={handleAddPhoto}
                    disabled={!newPhoto}
                    className="px-4 py-2"
                  >
                    Add Photo
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Add at least one photo to complete your profile</p>
              </section>

              {/* Interests Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Interests</h2>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.interests.map((interest, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="ml-2 text-pink-600 hover:text-pink-900"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newInterest}
                    onChange={(e) => setNewInterest(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                    placeholder="Add an interest and press Enter"
                    className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                  />
                  <Button 
                    type="button"
                    onClick={handleAddInterest}
                    disabled={!newInterest.trim()}
                    className="px-4 py-2"
                  >
                    Add
                  </Button>
                </div>
              </section>

              {/* Location Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Location *</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      name="location.city"
                      value={formData.location?.city || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                    <input
                      type="text"
                      name="location.country"
                      value={formData.location?.country || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">Preferences *</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                  <div className="flex items-center gap-4">
                    <select
                      name="preferences.ageRange.min"
                      value={formData.preferences?.ageRange?.min || 18}
                      onChange={handleChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                    >
                      {Array.from({ length: 83 }, (_, i) => 18 + i).map(age => (
                        <option key={`min-${age}`} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500">to</span>
                    <select
                      name="preferences.ageRange.max"
                      value={formData.preferences?.ageRange?.max || 99}
                      onChange={handleChange}
                      className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-pink focus:border-transparent"
                    >
                      {Array.from({ length: 83 }, (_, i) => 18 + i).map(age => (
                        <option key={`max-${age}`} value={age}>
                          {age}
                        </option>
                      ))}
                    </select>
                    <span className="text-gray-500 text-sm">years old</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Maximum Distance: {formData.preferences?.distance || 50} km
                  </label>
                  <input
                    type="range"
                    name="preferences.distance"
                    min="1"
                    max="100"
                    value={formData.preferences?.distance || 50}
                    onChange={handleChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Interested In</label>
                  <div className="flex flex-wrap gap-4">
                    {['male', 'female', 'non-binary', 'prefer not to say'].map(gender => (
                      <label key={gender} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          name="preferences.gender"
                          value={gender}
                          checked={formData.preferences?.gender?.includes(gender) || false}
                          onChange={(e) => {
                            const value = e.target.value;
                            const newGenders = formData.preferences?.gender?.includes(value)
                              ? formData.preferences.gender.filter(g => g !== value)
                              : [...(formData.preferences?.gender || []), value];
                            handleChange({
                              target: {
                                name: 'preferences.gender',
                                value: newGenders
                              }
                            });
                          }}
                          className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-gray-700 capitalize">{gender}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              <div className="pt-4 border-t">
                <Button 
                  type="submit" 
                  className="w-full py-3 text-lg"
                  disabled={isSubmitting || formData.photos.length === 0}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <LoadingSpinner size="small" className="mr-2" />
                      Saving...
                    </span>
                  ) : (
                    'Save Profile'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfileSetup;