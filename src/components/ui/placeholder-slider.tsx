export function PlaceholderSlider() {
  return (
    <section className="relative h-[400px] md:h-[600px] bg-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <div className="mb-4">
          <svg 
            className="mx-auto h-16 w-16 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1} 
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600">Nav pievienoti slaidi</p>
        <p className="text-sm text-gray-400 mt-1">Slaidi tiks parādīti šeit, kad tie būs izveidoti admin panelī</p>
      </div>
    </section>
  );
}