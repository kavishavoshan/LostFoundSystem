import { useState, useRef } from 'react';
import { CameraIcon, MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';
import Swal from 'sweetalert2';

const Feature = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [activeTab, setActiveTab] = useState('lost'); // 'lost' or 'found'
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [showCamera, setShowCamera] = useState(false);

  // Start camera
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = mediaStream;
      setStream(mediaStream);
      setShowCamera(true);
    } catch (err) {
      Swal.fire({
        title: 'Camera Error',
        text: 'Could not access camera. Please check permissions.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    }
  };

  // Stop camera
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageUrl = canvas.toDataURL('image/jpeg');
    setPreview(imageUrl);
    
    // Convert to file object
    canvas.toBlob(blob => {
      const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
      setImage(file);
    }, 'image/jpeg');
    
    stopCamera();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(file);
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const searchSimilarItems = async () => {
    if (!image) {
      Swal.fire({
        title: 'No Image',
        text: 'Please capture or upload an image first',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Simulate API call with mock data
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock search results
      const mockResults = [
        {
          id: 1,
          image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          title: 'Black Leather Wallet',
          location: 'Found in Cafeteria',
          date: '2023-05-15',
          status: 'found',
          contact: 'security@example.com'
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          title: 'Black Wallet',
          location: 'Lost at Library',
          date: '2023-05-10',
          status: 'lost',
          contact: 'john.doe@example.com'
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1542037104857-ffbb0b9155fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
          title: 'Leather Wallet with Cards',
          location: 'Found at Parking Lot',
          date: '2023-05-12',
          status: 'found',
          contact: 'lostandfound@example.com'
        }
      ];
      
      setSearchResults(mockResults);
      
      Swal.fire({
        title: 'Search Complete!',
        text: `Found ${mockResults.length} similar items`,
        icon: 'success',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      Swal.fire({
        title: 'Search Failed',
        text: 'Could not search for items. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK'
      });
    } finally {
      setIsSearching(false);
    }
  };

  const resetSearch = () => {
    setImage(null);
    setPreview(null);
    setSearchResults([]);
  };

  const claimItem = (itemId) => {
    Swal.fire({
      title: 'Claim Item',
      text: `Contact ${searchResults.find(i => i.id === itemId).contact} to claim this item.`,
      icon: 'info',
      confirmButtonText: 'OK'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Lost & Found Item Search
          </h1>
          <p className="mt-3 text-xl text-gray-500">
            Capture or upload a photo to search for matching items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Capture Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Item Capture</h2>
              <p className="mt-1 text-sm text-gray-500">
                Take a photo or upload an image of the item
              </p>
            </div>

            <div className="px-6 py-5">
              {showCamera ? (
                <div className="relative">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    className="w-full h-64 object-cover rounded-md"
                  />
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                    >
                      <CameraIcon className="h-5 w-5 mr-2" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : preview ? (
                <div className="relative">
                  <img
                    src={preview}
                    alt="Captured item"
                    className="w-full h-64 object-contain rounded-md"
                  />
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={searchSimilarItems}
                      disabled={isSearching}
                      className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                        isSearching ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSearching ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Searching...
                        </>
                      ) : (
                        <>
                          <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
                          Search Items
                        </>
                      )}
                    </button>
                    <button
                      onClick={resetSearch}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                      <CameraIcon className="h-12 w-12 text-gray-400" />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <button
                        onClick={startCamera}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center justify-center"
                      >
                        <CameraIcon className="h-5 w-5 mr-2" />
                        Open Camera
                      </button>
                      <label
                        htmlFor="file-upload"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-gray-700 hover:bg-gray-50 flex items-center justify-center cursor-pointer"
                      >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Upload Photo
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          className="sr-only"
                          accept="image/*"
                          onChange={handleImageUpload}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Search Results</h2>
                <div className="flex rounded-md shadow-sm">
                  <button
                    onClick={() => setActiveTab('lost')}
                    className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                      activeTab === 'lost' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Lost Items
                  </button>
                  <button
                    onClick={() => setActiveTab('found')}
                    className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                      activeTab === 'found' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Found Items
                  </button>
                </div>
              </div>
            </div>

            <div className="px-6 py-5">
              {searchResults.length === 0 ? (
                <div className="text-center py-12">
                  <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No items found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {preview 
                      ? "We couldn't find any matching items. Try adjusting your photo."
                      : "Capture or upload a photo to search for matching items."}
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {searchResults
                    .filter(item => item.status === activeTab)
                    .map((item) => (
                      <li key={item.id} className="py-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <img
                              className="h-16 w-16 rounded-md object-cover"
                              src={item.image}
                              alt={item.title}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {item.title}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {item.location} • {item.date}
                            </p>
                          </div>
                          <div>
                            <button
                              onClick={() => claimItem(item.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                            >
                              {item.status === 'found' ? 'Claim' : 'Contact'}
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* AI Features Banner */}
        <div className="mt-8 bg-indigo-50 rounded-lg p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-full">
              <SparklesIcon className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-indigo-800">Powered by AI</h3>
              <p className="text-sm text-indigo-600">
                Our advanced image recognition helps match your items with our database of lost and found objects.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feature;