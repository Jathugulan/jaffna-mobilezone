import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Clock, Phone, ExternalLink } from 'lucide-react';

interface StoreMapProps {
  className?: string;
  height?: string;
  showDetailsCard?: boolean;
}

// Jaffna Flagship Showroom Coordinates (Hospital Road, Jaffna)
const STORE_COORDS: [number, number] = [9.6647, 80.0167];
const STORE_NAME = 'Jaffna Mobile Zone — Flagship Store';
const STORE_ADDRESS = 'No. 142, Hospital Road, Jaffna 40000, Sri Lanka';
const DIRECTIONS_URL = 'https://www.google.com/maps/dir/?api=1&destination=9.6647,80.0167';

export const StoreMap: React.FC<StoreMapProps> = ({
  className = '',
  height = '420px',
  showDetailsCard = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already initialized on same DOM
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: STORE_COORDS,
      zoom: 15,
      scrollWheelZoom: false,
    });

    // OpenStreetMap Standard Tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Custom Styled Leaflet Pin with JMZ branding
    const customIcon = L.divIcon({
      className: 'jmz-map-pin',
      html: `
        <div style="
          width: 44px;
          height: 44px;
          border-radius: 50% 50% 50% 0;
          background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
          transform: rotate(-45deg);
          box-shadow: 0 8px 24px rgba(37,99,235,0.45), 0 2px 6px rgba(0,0,0,0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid #ffffff;
        ">
          <div style="
            transform: rotate(45deg);
            color: #ffffff;
            font-weight: 900;
            font-size: 11px;
            letter-spacing: -0.5px;
          ">
            JMZ
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 44],
      popupAnchor: [0, -44],
    });

    const marker = L.marker(STORE_COORDS, { icon: customIcon }).addTo(map);

    // Interactive Leaflet Popup
    const popupContent = `
      <div style="padding: 6px 2px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="font-weight: 800; font-size: 14px; color: #0f172a; margin-bottom: 4px;">
          ${STORE_NAME}
        </div>
        <div style="font-size: 12px; color: #475569; margin-bottom: 8px; line-height: 1.4;">
          📍 ${STORE_ADDRESS}
        </div>
        <div style="font-size: 11px; color: #2563eb; font-weight: 600; margin-bottom: 8px;">
          🕒 Mon – Sat: 9:00 AM – 8:00 PM<br/>📞 +94 21 222 4567
        </div>
        <a href="${DIRECTIONS_URL}" target="_blank" rel="noopener noreferrer" style="
          display: inline-block;
          background: #2563eb;
          color: #ffffff;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-decoration: none;
        ">
          Get Turn-by-Turn Directions →
        </a>
      </div>
    `;

    marker.bindPopup(popupContent).openPopup();
    mapInstanceRef.current = map;

    // Invalidate size in case of layout reflows
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={`relative overflow-hidden rounded-featured border border-line bg-card shadow-card ${className}`}>
      {/* Interactive Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{ height }}
        className="w-full z-0 outline-none"
      />

      {/* Floating Store Info Badge Card */}
      {showDetailsCard && (
        <div className="sm:absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-md z-10 p-5 rounded-card border border-line bg-white/95 dark:bg-[#0d1117]/95 backdrop-blur-xl shadow-premium space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:border-blue-500/25 dark:bg-blue-500/10 dark:text-blue-300">
                <MapPin className="h-3 w-3" /> Flagship Showroom
              </span>
              <h4 className="mt-1.5 text-sm font-extrabold tracking-[-0.02em] text-ink sm:text-base">
                Jaffna Mobile Zone
              </h4>
            </div>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-xl bg-grad-primary p-2.5 text-white shadow-md shadow-blue-600/25 transition-all duration-150 hover:brightness-110 hover:scale-105 focus-ring"
              title="Get Directions"
            >
              <Navigation className="h-4 w-4" />
            </a>
          </div>

          <div className="space-y-1.5 text-xs text-ink-2">
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{STORE_ADDRESS}</span>
            </p>
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <span>Mon – Sat: 9:00 AM – 8:00 PM | Sun: 10:00 AM – 4:00 PM</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
              <span>+94 21 222 4567 / WhatsApp: +94 77 123 4567</span>
            </p>
          </div>

          <div className="flex items-center justify-between border-t border-line pt-3">
            <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-jmzPulseRing" />
              Store Open Now
            </span>
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-hover"
            >
              Open in Maps <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
