import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { createLostItem, updateLostItem } from '../../api/lostItems';
import { createFoundItem, updateFoundItem } from '../../api/foundItems';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../UI/Spinner';
import { compressAndConvertImage } from '../../utils/imageProcessor';

const CATEGORIES = [
  "Card", "Headphone", "Key", "Keyboard", "Lapcharger", "Laptop",
  "Mouse", "Smartphone", "Unknown", "Wallets", "backpack"
];

const ItemForm = ({ type = 'lost', onClose, item = null }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { user: authUser } = useAuth();

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
      contactNumber: '',
      location: '',
      description: '',
      category: 'Unknown',
      image: null
    }
  });

  const imageField = watch('image');

  useEffect(() => {
    if (authUser) {
      setValue('contactNumber', authUser.mobileNumber || authUser.phoneNumber || '');
    }

    if (item) {
      reset({
        contactNumber: item.contactNumber || '',
        location: item.location || '',
        description: item.description || '',
        category: item.category || 'Unknown',
        image: null
      });

      if (item.imageUrl) {
        setPreviewUrl(item.imageUrl);
      }
    } else {
      reset();
      setPreviewUrl(null);
    }
  }, [authUser, item, setValue, reset]);

  useEffect(() => {
    if (imageField instanceof File) {
      const url = URL.createObjectURL(imageField);
      setPreviewUrl(url);

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
          setValue('category', data.predicted_category || 'Unknown');
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
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|jpg)$/)) {
      setError('image', {
        type: 'manual',
        message: 'Please upload a valid image file (JPG, PNG)'
      });
      return;
    }

    try {
      const processedImage = await compressAndConvertImage(file);
      setValue('image', processedImage);
      clearErrors('image');
    } catch (error) {
      console.error('Error processing image:', error);
      setError('image', {
        type: 'manual',
        message: 'Error processing image. Please try again.'
      });
    }
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const payload = {
        userId: authUser?.id,
        description: data.description.trim(),
        contactNumber: data.contactNumber.trim(),
        category: data.category,
        image: imageField,
        location: data.location.trim()
      };

      if (item) {
        // Edit mode
        if (type === 'lost') {
          await updateLostItem(item.id || item._id, payload);
        } else {
          await updateFoundItem(item.id || item._id, payload);
        }
      } else {
        // Create mode
        if (type === 'lost') {
          await createLostItem(payload);
        } else {
          await createFoundItem(payload);
        }
      }

      reset();
      setPreviewUrl(null);
      onClose?.();
    } catch (error) {
      console.error(`Error submitting ${type} item:`, error);
      alert(error?.response?.data?.message || error.message || 'Submission failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Contact Number */}
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
        />
        {errors.contactNumber && <p className="text-sm text-red-600">{errors.contactNumber.message}</p>}
      </div>

      {/* Location */}
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
        <input
          id="location"
          {...register('location', {
            required: 'Location is required',
            minLength: { value: 3, message: 'Location must be at least 3 characters' }
          })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
        {errors.location && <p className="text-sm text-red-600">{errors.location.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Item Category {isPredicting && <span className="text-xs text-gray-500 ml-2">(Predicting...)</span>}
        </label>
        <select
          id="category"
          disabled={isPredicting}
          {...register('category', { required: 'Please select a category' })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {errors.category && <p className="text-sm text-red-600">{errors.category.message}</p>}
      </div>

      {/* Image Upload */}
      <div>
        <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">Item Photo</label>
        <div className="mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10">
          {previewUrl && (
            <img src={previewUrl} alt="Preview" className="mx-auto h-32 w-auto mb-4 object-contain" />
          )}
          <label className="cursor-pointer text-orange-600 font-semibold">
            <span>{previewUrl ? 'Change Photo' : 'Upload a Photo'}</span>
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              {...register('image')}
              onChange={handleImageChange}
            />
          </label>
          <p className="text-xs text-gray-600 mt-2">JPG or PNG, up to 10MB</p>
        </div>
        {errors.image && <p className="text-sm text-red-600">{errors.image.message}</p>}
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
        />
        {errors.description && <p className="text-sm text-red-600">{errors.description.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-700 hover:text-gray-500">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 disabled:opacity-50"
        >
          {isLoading ? <><Spinner /><span className="ml-2">Submitting...</span></> : item ? 'Update Item' : 'Submit Item'}
        </button>
      </div>
    </form>
  );
};

export default ItemForm;
