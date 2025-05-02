import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createLostItem } from '../../api/lostItems';
import { createFoundItem } from '../../api/foundItems';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../UI/Spinner';
import { compressAndConvertImage } from '../../utils/imageProcessor';


const CATEGORIES = [
  "Card",
  "Headphone",
  "Key",
  "Keyboard",
  "Lapcharger",
  "Laptop",
  "Mouse",
  "Smartphone",
  "Unknown",
  "Wallets",
  "backpack"
];

const ItemForm = ({ type = 'lost', onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const { user: authUser } = useAuth();
  const [previewUrl, setPreviewUrl] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm({
    defaultValues: {
      contactNumber: authUser?.mobileNumber || authUser?.phoneNumber || '',
      location: '',
      description: '',
      category: 'Unknown',
      image: null,
    }
  });

  useEffect(() => {
    if (authUser) {
      // Pre-populate form with user data when available
      setValue('contactNumber', authUser.mobileNumber || authUser.phoneNumber || '');
    }
  }, [authUser, setValue]);

  const imageField = watch('image');

  useEffect(() => {
    if (imageField instanceof File) {
      const url = URL.createObjectURL(imageField);
      setPreviewUrl(url);

      // Get category prediction for the image
      const predictCategory = async () => {
        setIsPredicting(true);
        try {
          const formData = new FormData();
          formData.append('image', imageField);
          
          const response = await fetch('http://localhost:5001/predict', {
            method: 'POST',
            body: formData
          });
          
          const data = await response.json();
          if (data.predicted_category) {
            setValue('category', data.predicted_category);
          } else {
            setValue('category', 'Unknown');
          }
        } catch (error) {
          console.error('Error predicting category:', error);
          setValue('category', 'Unknown');
        } finally {
          setIsPredicting(false);
        }
      };
      
      predictCategory();
      return () => URL.revokeObjectURL(url);
    }
  }, [imageField, setValue]);

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
        setError('image', {
          type: 'manual',
          message: 'Please upload a valid image file (JPG, PNG)',
        });
        return;
      }
      
      try {
        // Process the image
        const processedImage = await compressAndConvertImage(file);
        console.log('Processed image:', processedImage);
        setValue('image', processedImage);
        clearErrors('image');
      } catch (error) {
        console.error('Error processing image:', error);
        setError('image', {
          type: 'manual',
          message: 'Error processing image. Please try again.',
        });
      }
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);

      if (!authUser?.id) {
        throw new Error('User ID not found. Please log in again.');
      }

      const submitPayload = {
        userId: authUser.id,
        description: data.description.trim(),
        contactNumber: data.contactNumber.trim(),
        category: data.category,
        image: data.image,
        location: data.location.trim(),
      };

      const response = type === 'lost'
        ? await createLostItem(submitPayload)
        : await createFoundItem(submitPayload);

      console.log('Item created successfully:', response);
      reset();
      setPreviewUrl(null);
      onClose?.();

    } catch (error) {
      console.error(`Error creating ${type} item:`, error);
      let errorMessage = `Failed to create ${type} item. `;
      if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Number field */}
      <div>
        <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Contact Number</label>
        <input
          type="tel"
          id="contactNumber"
          {...register('contactNumber', {
            required: 'Contact number is required',
            pattern: {
              value: /^[0-9]{10}$/,
              message: 'Please enter a valid 10-digit phone number'
            }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
          placeholder="Enter your contact number"
        />
        {errors.contactNumber && (
          <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
        )}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input
          type="text"
          id="location"
          {...register('location', {
            required: 'Location is required',
            minLength: { value: 3, message: 'Location must be at least 3 characters' }
          })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.location ? 'border-red-500 ring-red-500' : ''}`}
        />
        {errors.location && (
          <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
        )}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Item Category {isPredicting && <span className="text-sm text-gray-500 ml-2">(Predicting...)</span>}
        </label>
        <select
          id="category"
          disabled={isPredicting}
          {...register('category', { required: 'Please select a category' })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.category ? 'border-red-500 ring-red-500' : ''} ${isPredicting ? 'opacity-50 cursor-wait' : ''}`}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
        )}
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
          Item Photo
        </label>
        <div className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 ${errors.image ? 'border-red-500' : 'border-gray-900/25'}`}>
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto max-w-full object-contain mb-4" />
          )}
          <div className="text-center">
            <div className="mt-4 flex text-sm leading-6 text-gray-600">
              <label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                <span>{previewUrl ? 'Change photo' : 'Upload a photo'}</span>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  {...register('image', {
                    required: false,
                    validate: {
                      fileType: (value) => {
                        if (value?.[0]) {
                          const file = value[0];
                          if (!file.type.match(/^image\/(jpeg|png|gif|jpg)$/)) {
                            return 'Please upload a valid image file (JPG, PNG, or GIF)';
                          }
                        }
                        return true;
                      },
                      // fileSize: (value) => {
                      //   if (value?.[0]) {
                      //     const file = value[0];
                      //     if (file.size > 10 * 1024 * 1024) {
                      //       return 'Image size must be less than 10MB';
                      //     }
                      //   }
                      //   return true;
                      // }
                    }
                  })}
                  onChange={(e) => handleImageChange(e)}
                />
              </label>
            </div>
            <p className="text-xs text-gray-600 mt-2">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          rows={4}
          {...register('description', {
            required: 'Description is required',
            minLength: { value: 10, message: 'Description must be at least 10 characters' }
          })}
          className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.description ? 'border-red-500 ring-red-500' : ''}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Spinner />
              <span className="ml-2">Submitting...</span>
            </>
          ) : (
            `Submit ${type === 'lost' ? 'Lost' : 'Found'} Item`
          )}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;