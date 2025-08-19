export function PlaceholderSlider() {
  return (
    <section className="relative h-[400px] md:h-[600px] bg-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-500 max-w-md mx-auto px-4">
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
        <p className="text-lg font-medium text-gray-600 mb-3">Nav pievienoti slaidi</p>
        <div className="bg-white rounded-lg p-4 text-left text-sm border">
          <p className="font-medium text-gray-700 mb-2">Kā pievienot slaiderus:</p>
          <ol className="text-gray-600 space-y-1 list-decimal list-inside">
            <li>Atveriet admin paneli (Admin poga augšējā joslā)</li>
            <li>Dodieties uz "Slaideris" sadaļu</li>
            <li>Noklikšķiniet "Pievienot jaunu slaidu"</li>
            <li>Augšupielādējiet desktop un mobile bildes</li>
            <li>Pievienojiet tekstu visās 3 valodās (LV, EN, RU)</li>
            <li>Saglabājiet slaidu</li>
          </ol>
          <p className="text-xs text-gray-500 mt-3">
            Slaidi tiks automātiski attēloti šajā vietā pēc saglabāšanas.
          </p>
        </div>
      </div>
    </section>
  );
}