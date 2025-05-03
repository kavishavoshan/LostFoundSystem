import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto text-center mb-16">
        <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
          About Reclaim
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
          Reuniting lost items with their owners, effortlessly.
        </p>
      </div>

      {/* Image Banner (Replace with your image) */}
      <div className="mb-16 rounded-lg overflow-hidden shadow-xl max-w-4xl mx-auto">
        <img
          src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
          alt="Lost and Found Community"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Mission Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
        <p className="text-lg text-gray-600">
          At <span className="font-semibold text-blue-600">Reclaim</span>, we believe losing something valuable shouldn’t mean losing hope. We simplify the lost and found process with technology and community.
        </p>
      </div>

      {/* How It Works */}
      <div className="max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "Report Lost Items",
              desc: "Instantly post details about your missing belongings.",
              emoji: "🔍",
            },
            {
              title: "Search Found Items",
              desc: "Browse listings of items recovered by others.",
              emoji: "📱",
            },
            {
              title: "Verify & Recover",
              desc: "Securely connect with finders to reclaim what’s yours.",
              emoji: "✅",
            },
          ].map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center">
              <span className="text-4xl mb-4 inline-block">{step.emoji}</span>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-600">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us */}
      <div className="bg-blue-50 py-12 px-4 rounded-lg max-w-7xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Choose Reclaim?</h2>
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            "✅ Smart AI-powered matching",
            "✅ Trusted community network",
            "✅ Simple & secure platform",
            "✅ Fast recovery process",
            "✅ Free for basic use",
            "✅ Global reach",
          ].map((item, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-blue-600">✓</span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA Section */}
      <div className="text-center max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Join Thousands Who Recovered Their Items</h2>
        
      </div>
    </div>
  );
};

export default AboutUs;