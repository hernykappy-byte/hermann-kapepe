import React from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";

const geoUrl =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { markerOffset: -15, name: "New York", coordinates: [-74.006, 40.7128], players: 3200 },
  { markerOffset: -15, name: "London", coordinates: [-0.1276, 51.5074], players: 2800 },
  { markerOffset: 25, name: "Tokyo", coordinates: [139.6917, 35.6895], players: 4100 },
  { markerOffset: 25, name: "Sydney", coordinates: [151.2093, -33.8688], players: 1900 },
  { markerOffset: -15, name: "Paris", coordinates: [2.3522, 48.8566], players: 2100 },
  { markerOffset: -15, name: "Toronto", coordinates: [-79.3832, 43.6532], players: 1500 },
  { markerOffset: 15, name: "Berlin", coordinates: [13.405, 52.52], players: 1800 },
  { markerOffset: -15, name: "Cape Town", coordinates: [18.4232, -33.9249], players: 1200 },
  { markerOffset: 25, name: "Mumbai", coordinates: [72.8777, 19.076], players: 3500 },
  { markerOffset: -15, name: "Singapore", coordinates: [103.8198, 1.3521], players: 2400 },
  { markerOffset: -15, name: "Lusaka", coordinates: [28.2833, -15.4167], players: 8500 },
  { markerOffset: -15, name: "Sao Paulo", coordinates: [-46.6333, -23.5505], players: 2200 },
];

export const WorldMap = () => {
  return (
    <div className="w-full h-[400px] bg-[#0d081b] rounded-2xl overflow-hidden border border-white/10 relative shadow-inner">
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-serif">Global Player Distribution</h3>
        <p className="text-xs text-slate-400 font-mono mt-1">Real-time active nodes</p>
      </div>
      <ComposableMap
        projectionConfig={{
          scale: 140,
          center: [0, 20]
        }}
        width={800}
        height={400}
        style={{ width: "100%", height: "100%" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1f153a"
                stroke="#2a1d4d"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover: { fill: "#2D1B5E", outline: "none" },
                  pressed: { fill: "#2D1B5E", outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {markers.map(({ name, coordinates, markerOffset, players }) => {
          const radius = Math.max(3, (players / 8500) * 12);
          return (
            <Marker key={name} coordinates={coordinates as [number, number]}>
              <circle r={radius} fill="#C1294A" className="animate-pulse opacity-80" />
              <circle r={radius} fill="none" stroke="#C1294A" strokeWidth={2} className="animate-ping opacity-50" />
              <text
                textAnchor="middle"
                y={markerOffset}
                style={{ fontFamily: "var(--font-mono)", fill: "#F3F4F6", fontSize: "10px", fontWeight: "bold" }}
              >
                {name}
              </text>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};
