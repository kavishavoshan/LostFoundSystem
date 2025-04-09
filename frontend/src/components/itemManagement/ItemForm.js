import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
// *** IMPORTANT: Ensure these API functions are correctly implemented ***
// They MUST send the payload as a JSON object with 'Content-Type': 'application/json'
// and handle potential errors (like 4xx/5xx responses) appropriately.
import { createLostItem } from '../../api/lostItems';
import { createFoundItem } from '../../api/foundItems';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../UI/Spinner'; // Ensure this path is correct
import { getCurrentUser } from '../../api/user'; // API to get user details

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

// Helper function to read file as Base64 using Promises
const readFileAsBase64 = (file) => {
  console.log('Reading file as Base64:', file);
  return new Promise((resolve, reject) => {
    // Ensure file is a Blob
    const blob = file instanceof Blob ? file : new Blob([file], { type: file.type });
    
    const reader = new FileReader();
    reader.onloadend = () => {
      console.log('File read successfully');
      resolve(reader.result); // Resolve with Base64 string
    };
    reader.onerror = (error) => {
      console.error('Error reading file:', error);
      reject(error); // Reject on error
    };
    reader.readAsDataURL(blob); // Read blob as Data URL (Base64)
  });
};

const ItemForm = ({ type = 'lost', onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { user: authUser } = useAuth(); // Get user from Auth context if available
  const [previewUrl, setPreviewUrl] = useState(null); // For image preview

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset // Use reset to clear form on successful submission or cancellation
  } = useForm({
    defaultValues: {
      contactNumber: '',
      location: '',
      description: '',
      category: 'Unknown',
      image: '', // Will hold the File object initially, then cleared    // User's name (fetched)
      userId: ''    // User's ID (fetched)
    }
  });

  // Watch the image field (which holds the File object) to update preview
  const imageFieldValue = watch('image');

  // Update preview URL when image file value changes
  useEffect(() => {
    let objectUrl = null;
    if (imageFieldValue instanceof File) {
      objectUrl = URL.createObjectURL(imageFieldValue);
      setPreviewUrl(objectUrl);
    } else {
      // Clear preview if no file or invalid file
      setPreviewUrl(null);
    }

    // Cleanup function to revoke the object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [imageFieldValue]); // Rerun only when the File object changes


  // Fetch user data when component mounts or authUser changes
  useEffect(() => {
    const fetchUserData = async () => {
      let fetchedUserData = null;
      console.log('Attempting to fetch user data...');
      try {
        // 1. Check AuthContext
        if (authUser && authUser.id) {
          console.log('Using user data from AuthContext:', authUser.id);
          fetchedUserData = authUser;
        }
        // 2. Check localStorage (if AuthContext misses)
        else {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser && parsedUser.id) {
              console.log('Using user data from localStorage:', parsedUser.id);
              fetchedUserData = parsedUser;
            } else {
               console.log('User in localStorage invalid or missing ID.');
            }
          } else {
             console.log('No user data in localStorage.');
          }
        }

        // 3. Fetch from API if still no user data with a valid ID
        if (!fetchedUserData || !fetchedUserData.id) {
          console.log('No valid user data from context/storage, fetching from API...');
          const response = await getCurrentUser(); // Ensure this function handles errors
          console.log('API response for current user:', response);
          if (response.success && response.data && response.data.id) {
            console.log('Using user data from API:', response.data.id);
            fetchedUserData = response.data;
            // Update localStorage with fresh data
            localStorage.setItem('user', JSON.stringify(response.data));
          } else {
             console.error('Could not retrieve valid user data (with ID) from API.', response);
          }
        }

        // Update form only if we have valid user data with an ID
        if (fetchedUserData && fetchedUserData.id) {
          updateFormWithUserData(fetchedUserData);
        } else {
            // This case means user ID could not be determined.
            // The onSubmit validation will catch this, but logging is useful.
            console.error('User ID could not be determined after checking all sources.');
            // Consider alerting the user here if needed.
            // alert('Could not verify user information. Please log in again.');
        }

      } catch (error) {
        console.error('Error during fetchUserData process:', error);
        // Alert user or handle error state appropriately
        // alert('Failed to load your details. Please try refreshing or logging in again.');
      }
    };

    fetchUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]); // Re-run if authUser context changes

  // Function to update form fields with user data
  const updateFormWithUserData = (userData) => {
    // Ensure userData and id exist before proceeding
    if (!userData || !userData.id) {
       console.warn("updateFormWithUserData called with invalid data:", userData);
       return;
    }
    const nameValue = userData.firstName && userData.lastName
      ? `${userData.firstName} ${userData.lastName}`
      : userData.email?.split('@')[0] || 'User';
    // Prioritize mobileNumber, fallback to phoneNumber, then empty string
    const contactValue = userData.mobileNumber || userData.phoneNumber || '';
    const userIdValue = userData.id; // Should be guaranteed non-empty here

    console.log('Updating form state with User Data:', { nameValue, contactValue, userIdValue });

    // Use setValue to update react-hook-form state
    setValue('name', nameValue, { shouldDirty: true }); // Mark form as dirty if needed
    setValue('contactNumber', contactValue, { shouldDirty: true });
    setValue('userId', userIdValue, { shouldDirty: true }); // Crucial: Set the user ID

  };

  // Function to predict category using the ML service
  const predictCategory = async (file) => {
    if (!file) return; // Don't run if no file

    // This uses FormData specifically for the ML endpoint
    const mlFormData = new FormData();
    mlFormData.append('file', file);

    // Show a loading indicator specific to prediction? Or reuse main one?
    // For simplicity, reuse main isLoading, but could use separate state.
    setIsLoading(true);
    try {
      console.log('Sending image to ML server for prediction...');
      const response = await fetch('http://127.0.0.1:5000/upload-found-item', { // Your ML Endpoint
        method: 'POST',
        body: mlFormData,
      });

      if (!response.ok) {
        // Try to get error message from ML service response
        let errorText = `ML prediction failed: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            errorText = errorData.message || errorData.error || errorText;
        } catch (e) { /* Ignore if response is not JSON */ }
        console.error('ML Server error response:', errorText);
        throw new Error(errorText);
      }

      const data = await response.json();
      console.log('ML Server Prediction Response:', data);

      // Extract predicted category (handle different possible response keys)
      let predictedCategory = data.predicted_class || data.category || data.prediction || (typeof data === 'string' ? data : null);

      if (predictedCategory) {
        predictedCategory = predictedCategory.trim();
        // Normalize to Title Case for matching CATEGORIES array
        predictedCategory = predictedCategory.charAt(0).toUpperCase() + predictedCategory.slice(1).toLowerCase();

        // Find the closest match in our defined CATEGORIES, default to Unknown
        const matchedCategory = CATEGORIES.find(cat => cat.toLowerCase() === predictedCategory.toLowerCase());
        const finalCategory = matchedCategory || 'Unknown';

        console.log('Setting predicted category:', finalCategory);
        setValue('category', finalCategory, { shouldDirty: true }); // Update category field
      } else {
          console.log('ML service did not return a predictable category.');
          // Optionally set to 'Unknown' explicitly, or leave as is if user selected something
          // setValue('category', 'Unknown');
      }
    } catch (error) {
      console.error('Error predicting category:', error);
      // Inform user prediction failed but they can continue manually
      alert(`Could not automatically predict category: ${error.message}.\nPlease select the category manually.`);
    } finally {
      // Decide if ML prediction failure should stop the main loading indicator
      // If prediction is optional, maybe don't stop the main spinner here
      // unless you use a separate loading state for prediction.
      // For now, assume prediction is quick or part of the overall loading.
       setIsLoading(false); // Stop spinner after prediction attempt
    }
  };

  // Handle file input change: Update form state and trigger prediction
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    console.log('Image file selected:', file);
    if (file) {
      setValue('image', file, { shouldValidate: true });
      predictCategory(file);
      console.log('Image file set in form state:', file);
    } else {
      setValue('image', null, { shouldValidate: true });
    }
  };

  // --- Form Submission Handler ---
  const onSubmit = async (formData) => {
    setIsLoading(true); // Start loading indicator
    try {
      // --- Pre-submission Validation (Client-side) ---
      // Destructure data from react-hook-form's state
      const { userId, contactNumber, location, category, description, image } = formData;

      // 1. Validate userId (Crucial - must be fetched before submission)
      if (!userId || typeof userId !== 'string' || userId.trim() === '') {
        // This indicates user data wasn't loaded correctly.
        alert('User information could not be verified. Please ensure you are logged in and try again.');
        setIsLoading(false);
        return; // Stop submission
      }

      // 2. Validate other required fields (Trim checks prevent whitespace-only inputs)
      if (!location?.trim() || !description?.trim() || !category?.trim() || !contactNumber?.trim()) {
         // React-hook-form required rules should catch this, but double-check.
         alert('Please ensure Location, Description, Category, and Contact Number are filled correctly.');
         setIsLoading(false);
         return;
      }


      // --- Prepare JSON Payload for API ---
      const submitPayload = {
        userId: userId,
         // Include name (fetched)
        contactNumber: contactNumber, // Include contact (fetched)
        location: location.trim(), // Send trimmed values
        description: description.trim(),
        category: category, // Already validated
        imageUrl: null // Changed from 'image' to 'imageUrl' to match backend
      };

      // Process image only if it exists and is a File object
      
        try {
          console.log("Converting image to Base64...");
          const base64Image = await readFileAsBase64(image);
          submitPayload.imageUrl = base64Image; // Changed to imageUrl to match backend schema
          console.log("Image successfully converted to Base64");
        } catch (error) {
          console.error("Error processing image to Base64:", error);
          alert("Failed to process the image file. Please try again with a different image.");
          setIsLoading(false);
          return; // Stop submission if image processing fails
        }
      

      // --- Optional: Adjust payload based on 'type' if backend differs ---
      // If the `/lost-items` endpoint specifically forbids the 'image' key (even if null),
      // uncomment and adapt the following block based on the exact backend requirement/error:
      if (type === 'lost') {
         // Example: If backend errors if 'image' key exists at all for lost items:
         delete submitPayload.imageUrl;
         console.log('Removed image key for lost item payload for lost item.');
      }


      // --- Make API Call ---
      // Ensure createLostItem/createFoundItem send `submitPayload` as JSON
      console.log(`Submitting ${type} item payload to API:`, /* Avoid logging full Base64: */ {...submitPayload, ...(submitPayload.imageUrl ? { imageUrl: '<<Base64 Data>>' } : {}) });

      // Call the appropriate API function based on 'type'
      const response = type === 'lost'
        ? await createLostItem(submitPayload)
        : await createFoundItem(submitPayload);

      console.log('API raw response:', response);

      // --- Handle API Response ---
      // Check response for success (adapt keys based on your actual API structure)
      // Common indicators: status code 200/201, a success flag, or presence of created item ID.
      // Assuming API functions might return the parsed JSON data or throw on network/HTTP error.
      if (response && (response.success || response.id || response._id || response.statusCode === 200 || response.statusCode === 201)) {
         alert(`Item ${type} submitted successfully!`);
         reset(); // Clear the form fields
         onClose(); // Close the modal/form
      } else {
          // Handle cases where API call succeeded network-wise but indicated logical failure
          const backendMessage = response?.message || response?.error || 'API did not indicate success.';
          const errorMessage = Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage;
          console.error('API reported submission failure:', response);
          throw new Error(errorMessage); // Throw error to be caught below
      }

    } catch (error) {
      // Catch errors from validation, Base64 conversion, API call, or response handling
      console.error(`Error submitting ${type} item form:`, error);

      // Attempt to get a more specific message from Axios/Fetch errors
      let displayMessage = error.message || 'An unexpected error occurred.';
      if (error.response && error.response.data) { // Axios specific error structure
        const backendMessage = error.response.data.message || error.response.data.error;
        if (backendMessage) {
           displayMessage = Array.isArray(backendMessage) ? backendMessage.join('\n') : backendMessage;
        } else {
           displayMessage = `Server responded with status ${error.response.status}.`;
        }
      } else if (error.cause) { // Sometimes fetch errors have a 'cause'
         displayMessage += `\nCause: ${error.cause}`;
      }

      // Display the error to the user
      alert(`Submission Failed:\n${displayMessage}\nPlease check your input and try again.`);

    } finally {
      setIsLoading(false); // Ensure spinner stops in all cases
    }
  };


  // --- Render the Form ---
  return (
    // Use handleSubmit to trigger validation and pass data to onSubmit
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">

        {/* Name (Readonly, Fetched) */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Your Name</label>
          <input
            id="name"
            type="text"
            disabled
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed focus:outline-none"
            placeholder="Loading..."
          />
        </div>

        {/* Contact Number (Readonly, Fetched) */}
        <div>
          <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700">Your Contact Number</label>
          <input
            id="contactNumber"
            type="tel"
            disabled
            {...register('contactNumber')}
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm cursor-not-allowed focus:outline-none"
            placeholder="Loading..."
          />
          {/* Error display might be needed if backend validation fails post-submit */}
          {errors.contactNumber && (
             <p className="mt-1 text-sm text-red-600">{errors.contactNumber.message}</p>
           )}
        </div>

        {/* Location (Required, Editable) */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700">
            Location {type === 'lost' ? 'Lost' : 'Found'}
          </label>
          <input
            id="location"
            type="text"
            {...register('location', {
              required: 'Location is required',
              validate: value => (value && value.trim() !== '') || 'Location cannot be just whitespace'
             })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.location ? 'border-red-500 ring-red-500' : ''}`}
            placeholder={`e.g., Library Floor 3, Cafeteria Table 5`}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        {/* Category (Required, Editable) */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Item Category</label>
          <select
            id="category"
            {...register('category', { required: 'Please select a category' })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.category ? 'border-red-500 ring-red-500' : ''}`}
          >
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
          )}
        </div>

        {/* Item Photo Upload (Required for 'found') */}
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
            Item Photo {type === 'found' && <span className="text-red-500">*</span>}
          </label>
          <div className={`mt-2 flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-10 ${errors.image ? 'border-red-500' : 'border-gray-900/25'}`}>
             {/* Preview Area */}
             {previewUrl ? (
               <img src={previewUrl} alt="Item Preview" className="mx-auto h-32 w-auto max-w-full object-contain mb-4" />
             ) : (
               <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                 <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
               </svg>
             )}
             {/* Upload Trigger */}
             <div className="mt-4 flex text-sm leading-6 text-gray-600 text-center">
               <label htmlFor="image-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-orange-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-600 focus-within:ring-offset-2 hover:text-orange-500">
                 <span>{previewUrl ? 'Change file' : 'Upload a file'}</span>
                 {/* Input is visually hidden but provides file selection */}
                 <input
                   id="image-upload"
                   type="file" // Be specific about accepted types
                   className="sr-only"
                   // Register primarily for validation rules
                   {...register('image')}
                   // Use onChange to update form state via setValue
                   onChange={handleImageChange}
                 />
               </label>
               {/* <p className="pl-1">or drag and drop</p>  */} {/* Drag & drop requires extra JS */}
             </div>
             <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
             {/* Display validation errors for the image input */}
             {errors.image && (
                <p className="mt-1 text-sm text-red-600">{errors.image.message}</p>
             )}
           </div>
        </div>

        {/* Description (Required, Editable) */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Detailed Description</label>
          <textarea
            id="description"
            rows={4}
            {...register('description', {
              required: 'Description is required',
              minLength: { value: 10, message: 'Please provide at least 10 characters' },
              validate: value => (value && value.trim() !== '') || 'Description cannot be just whitespace'
            })}
            className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 ${errors.description ? 'border-red-500 ring-red-500' : ''}`}
            placeholder="Color, brand, size, any unique marks, where exactly it was lost/found..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        {/* Hidden User ID field (Registered) */}
        <input type="hidden" {...register('userId')} />

      </div>

      {/* --- Action Buttons --- */}
      <div className="flex justify-end gap-x-4 border-t border-gray-200 pt-6 mt-6">
        <button
          type="button"
          onClick={() => {
              reset(); // Optionally clear form on cancel
              onClose(); // Close modal/form
          }}
          disabled={isLoading} // Maybe allow cancel even when loading? Your choice.
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-60"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading} // Disable submit button while processing
          className="inline-flex justify-center items-center px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
             <>
               <Spinner /> {/* Ensure Spinner component is small enough */}
               <span className="ml-2">Submitting...</span>
             </>
            ) : (
             `Submit ${type === 'lost' ? 'Lost' : 'Found'} Item` // Dynamic button text
            )
          }
        </button>
      </div>
    </form>
  );
};

export default ItemForm;