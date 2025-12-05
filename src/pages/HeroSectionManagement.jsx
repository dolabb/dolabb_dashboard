import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { getHeroSection, updateHeroSection } from '../services/api';
import { useToast } from '../components/Toast';
import { FaImage, FaPalette, FaTextHeight, FaLink, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const HeroSectionManagement = () => {
  const { success, error: showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  
  const [formData, setFormData] = useState({
    image: null,
    backgroundType: 'image',
    imageUrl: '',
    singleColor: '#667eea',
    gradientColors: ['#667eea', '#764ba2'],
    gradientDirection: 'to right',
    title: '',
    subtitle: '',
    buttonText: '',
    buttonLink: '',
    textColor: '#FFFFFF',
    isActive: true,
  });

  useEffect(() => {
    fetchHeroSection();
  }, []);

  const fetchHeroSection = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getHeroSection();
      if (response.success && response.heroSection) {
        const hero = response.heroSection;
        
        // Normalize backgroundType to ensure it's valid
        const validTypes = ['image', 'single_color', 'gradient'];
        let backgroundType = (hero.backgroundType || 'image').trim().toLowerCase();
        if (!validTypes.includes(backgroundType)) {
          backgroundType = 'image';
        }
        
        // Parse gradientColors if it's a string
        let gradientColors = hero.gradientColors || ['#667eea', '#764ba2'];
        if (typeof gradientColors === 'string') {
          try {
            gradientColors = JSON.parse(gradientColors);
          } catch (e) {
            gradientColors = ['#667eea', '#764ba2'];
          }
        }
        
        setFormData({
          image: null,
          backgroundType: backgroundType,
          imageUrl: hero.imageUrl || '',
          singleColor: hero.singleColor || '#667eea',
          gradientColors: gradientColors,
          gradientDirection: hero.gradientDirection || 'to right',
          title: hero.title || '',
          subtitle: hero.subtitle || '',
          buttonText: hero.buttonText || '',
          buttonLink: hero.buttonLink || '',
          textColor: hero.textColor || '#FFFFFF',
          isActive: hero.isActive !== undefined ? hero.isActive : true,
        });
        if (hero.imageUrl) {
          setPreviewImage(hero.imageUrl);
        }
      }
    } catch (err) {
      setError('Failed to load hero section');
      showError('Failed to load hero section');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Validate backgroundType to ensure it's always one of the valid values
    if (name === 'backgroundType') {
      const validTypes = ['image', 'single_color', 'gradient'];
      const normalizedValue = value.trim().toLowerCase();
      if (validTypes.includes(normalizedValue)) {
        setFormData(prev => ({
          ...prev,
          [name]: normalizedValue,
        }));
      } else {
        // Fallback to 'image' if invalid
        setFormData(prev => ({
          ...prev,
          [name]: 'image',
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGradientColorChange = (index, value) => {
    const newColors = [...formData.gradientColors];
    newColors[index] = value;
    setFormData(prev => ({ ...prev, gradientColors: newColors }));
  };

  const handleAddGradientColor = () => {
    setFormData(prev => ({
      ...prev,
      gradientColors: [...prev.gradientColors, '#000000'],
    }));
  };

  const handleRemoveGradientColor = (index) => {
    if (formData.gradientColors.length > 1) {
      const newColors = formData.gradientColors.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, gradientColors: newColors }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Ensure backgroundType is valid and exactly matches expected values
      const validTypes = ['image', 'single_color', 'gradient'];
      let backgroundType = formData.backgroundType;
      
      // Convert to string and trim
      if (typeof backgroundType !== 'string') {
        backgroundType = String(backgroundType || 'image');
      }
      backgroundType = backgroundType.trim();
      
      // Validate it's exactly one of the valid types
      if (!validTypes.includes(backgroundType)) {
        console.error('Invalid backgroundType in form:', backgroundType, 'Type:', typeof backgroundType);
        throw new Error(`Invalid background type: "${backgroundType}". Must be one of: ${validTypes.join(', ')}`);
      }

      // Prepare data with validated backgroundType (ensure it's a string)
      const submitData = {
        ...formData,
        backgroundType: String(backgroundType), // Explicitly convert to string
      };

      const response = await updateHeroSection(submitData);
      if (response.success) {
        success('Hero section updated successfully');
        // Refresh data to get updated image URL if image was uploaded
        if (formData.image) {
          await fetchHeroSection();
        }
      } else {
        showError(response.error || 'Failed to update hero section');
        setError(response.error || 'Failed to update hero section');
      }
    } catch (err) {
      const errorMessage = err.message || 'An error occurred while updating hero section';
      showError(errorMessage);
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const getBackgroundPreview = () => {
    switch (formData.backgroundType) {
      case 'image':
        return previewImage ? `url(${previewImage})` : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
      case 'single_color':
        return formData.singleColor;
      case 'gradient':
        return `linear-gradient(${formData.gradientDirection}, ${formData.gradientColors.join(', ')})`;
      default:
        return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap">Hero Section Management</h1>
        <p className="text-gray-600 text-sm sm:text-base whitespace-nowrap">Customize your homepage hero section</p>
      </motion.div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Form Section */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* Background Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaPalette className="text-green-600" />
                Background Type
              </label>
              <select
                name="backgroundType"
                value={formData.backgroundType || 'image'}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="image">Image</option>
                <option value="single_color">Single Color</option>
                <option value="gradient">Gradient</option>
              </select>
              {/* Debug info - remove in production */}
              {process.env.NODE_ENV === 'development' && (
                <p className="text-xs text-gray-500 mt-1">Current value: "{formData.backgroundType}" (type: {typeof formData.backgroundType})</p>
              )}
            </div>

            {/* Image Upload */}
            {formData.backgroundType === 'image' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaImage className="text-green-600" />
                  Background Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
                <input
                  type="text"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                  placeholder="Or enter image URL"
                  className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            )}

            {/* Single Color */}
            {formData.backgroundType === 'single_color' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPalette className="text-green-600" />
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="singleColor"
                    value={formData.singleColor}
                    onChange={handleInputChange}
                    className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    name="singleColor"
                    value={formData.singleColor}
                    onChange={handleInputChange}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            {/* Gradient Colors */}
            {formData.backgroundType === 'gradient' && (
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FaPalette className="text-green-600" />
                  Gradient Colors
                </label>
                <div className="space-y-2">
                  {formData.gradientColors.map((color, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="color"
                        value={color}
                        onChange={(e) => handleGradientColorChange(index, e.target.value)}
                        className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={color}
                        onChange={(e) => handleGradientColorChange(index, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      {formData.gradientColors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveGradientColor(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddGradientColor}
                    className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Add Color
                  </button>
                </div>
                <div className="mt-2">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Gradient Direction</label>
                  <select
                    name="gradientDirection"
                    value={formData.gradientDirection}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="to right">To Right</option>
                    <option value="to bottom">To Bottom</option>
                    <option value="135deg">135deg</option>
                    <option value="to left">To Left</option>
                    <option value="to top">To Top</option>
                  </select>
                </div>
              </div>
            )}

            {/* Text Content */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaTextHeight className="text-green-600" />
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Welcome to Dolabb"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaTextHeight className="text-green-600" />
                Subtitle
              </label>
              <input
                type="text"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleInputChange}
                placeholder="Your marketplace"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Button Settings */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLink className="text-green-600" />
                Button Text
              </label>
              <input
                type="text"
                name="buttonText"
                value={formData.buttonText}
                onChange={handleInputChange}
                placeholder="Get Started"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaLink className="text-green-600" />
                Button Link
              </label>
              <input
                type="text"
                name="buttonLink"
                value={formData.buttonLink}
                onChange={handleInputChange}
                placeholder="/products"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Text Color */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <FaPalette className="text-green-600" />
                Text Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="textColor"
                  value={formData.textColor}
                  onChange={handleInputChange}
                  className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  name="textColor"
                  value={formData.textColor}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <FaToggleOn className="text-green-600" />
                Active Status
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* Preview Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Preview</h2>
          <div
            className="w-full h-96 rounded-lg flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
            style={{
              background: getBackgroundPreview(),
              backgroundSize: formData.backgroundType === 'image' ? 'cover' : 'auto',
              backgroundPosition: 'center',
              color: formData.textColor,
            }}
          >
            {formData.title && (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                {formData.title}
              </h1>
            )}
            {formData.subtitle && (
              <p className="text-lg sm:text-xl md:text-2xl mb-6">
                {formData.subtitle}
              </p>
            )}
            {formData.buttonText && (
              <button
                className="px-6 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg"
                style={{ color: formData.textColor === '#FFFFFF' ? '#1f2937' : formData.textColor }}
              >
                {formData.buttonText}
              </button>
            )}
            {!formData.title && !formData.subtitle && !formData.buttonText && (
              <p className="text-lg opacity-75">Preview will appear here</p>
            )}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong>{' '}
              <span className={formData.isActive ? 'text-green-600 font-semibold' : 'text-gray-500'}>
                {formData.isActive ? 'Active' : 'Inactive'}
              </span>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSectionManagement;

