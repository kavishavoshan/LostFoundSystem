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
          <h1 className="text-3xl font-extrabold text-[#0B1829] sm:text-4xl">
            Lost & Found Item Search
          </h1>
          <p className="mt-3 text-xl text-gray-600">
            Capture or upload a photo to search for matching items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Capture Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 bg-[#0B1829]">
              <h2 className="text-lg font-medium text-white">Item Capture</h2>
              <p className="mt-1 text-sm text-gray-300">
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
                      className="px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#E65A00] flex items-center transition-colors duration-200"
                    >
                      <CameraIcon className="h-5 w-5 mr-2" />
                      Capture Photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-[#0B1829] text-white rounded-md hover:bg-[#1A2634] flex items-center transition-colors duration-200"
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
                    className="w-full h-64 object-contain rounded-md border border-gray-200"
                  />
                  <div className="mt-4 flex justify-center space-x-4">
                    <button
                      onClick={searchSimilarItems}
                      disabled={isSearching}
                      className={`px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#E65A00] flex items-center transition-colors duration-200 ${
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
                      className="px-4 py-2 bg-[#0B1829] text-white rounded-md hover:bg-[#1A2634] flex items-center transition-colors duration-200"
                    >
                      <XMarkIcon className="h-5 w-5 mr-2" />
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-[#FF6B00] transition-colors duration-200">
                  <div className="space-y-4 text-center">
                    <div className="flex justify-center">
                      <CameraIcon className="h-12 w-12 text-[#FF6B00]" />
                    </div>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md font-medium text-[#FF6B00] hover:text-[#E65A00] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FF6B00]"
                      >
                        <span>Upload a file</span>
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
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    <button
                      onClick={startCamera}
                      className="px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#E65A00] flex items-center justify-center mx-auto transition-colors duration-200"
                    >
                      <CameraIcon className="h-5 w-5 mr-2" />
                      Use Camera
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-100">
            <div className="px-6 py-5 border-b border-gray-200 bg-[#0B1829]">
              <h2 className="text-lg font-medium text-white">Search Results</h2>
              <p className="mt-1 text-sm text-gray-300">
                Found items matching your search
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {searchResults.map((item) => (
                <div key={item.id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-24 w-24 object-cover rounded-md border border-gray-200"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0B1829] truncate">
                        {item.title}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {item.location}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.date}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'found'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>
                    <button
                      onClick={() => claimItem(item.id)}
                      className="px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#E65A00] transition-colors duration-200"
                    >
                      Contact
                    </button>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div className="p-6 text-center text-gray-500">
                  No items found. Try searching with a different image.
                </div>
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