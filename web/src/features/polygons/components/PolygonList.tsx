import React from 'react';

interface PolygonListProps {
  polygons: any[];
  deletePolygonHandler: (polygonId: string) => Promise<void>;
}

const PolygonList: React.FC<PolygonListProps> = ({ polygons, deletePolygonHandler }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Locais</h2>
      <ul className="space-y-2">
        {polygons.map((polygon) => (
          <li key={polygon.id} className="flex justify-between items-center p-2 bg-white rounded shadow">
            <span className="flex items-center">
              <span className="w-4 h-4 rounded-full bg-blue-500 mr-2"></span>
              {polygon.name}
            </span>
            <button
              onClick={() => deletePolygonHandler(polygon.id)}
              className="text-gray-500 hover:text-red-700"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PolygonList; 