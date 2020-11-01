import React, { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { FiClock, FiInfo } from "react-icons/fi";
import { Map, Marker, TileLayer } from "react-leaflet";
import L from 'leaflet';
import Sidebar from "../components/Sidebar";

import mapMarkerImg from '../images/map-marker.svg';

import '../styles/pages/orphanage.css';
import { useParams } from "react-router-dom";
import api from "../config/api";

const happyMapIcon = L.icon({
  iconUrl: mapMarkerImg,

  iconSize: [58, 68],
  iconAnchor: [29, 68],
  popupAnchor: [0, -60]
})

interface OrphanageProps {
  id: number
  name: string
  latitude: number
  longitude: number
  about: string
  instructions: string
  opening_hours: string
  open_on_weekends: boolean
  images: Array<{
    id: number
    path: string
  }>
}

interface OrphanageParams {
  id: string
}

export default function Orphanage() {
  const [orphanage, setOrphanage] = useState<OrphanageProps>()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const { id } = useParams<OrphanageParams>()

  useEffect(() => {
    async function fetchOrphanage() {
      const response = await api.get(`orphanages/${id}`)
      setOrphanage(response.data)
    }

    fetchOrphanage()
  }, [id])

  if (!orphanage)
    return <span>Loading</span>

  return (
    <div id="page-orphanage">
      <Sidebar />

      <main>
        <div className="orphanage-details">

          {orphanage.images.length && (
            <>
              <img src={orphanage.images[currentImageIndex].path} alt={orphanage.name} />

              <div className="images">
                {orphanage?.images.map((img, index) => {
                  return (
                    <button key={img.id}
                      type="button"
                      className={currentImageIndex === index ? 'active' : ''}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img src={img.path} alt={orphanage.name} />
                    </button>
                  )
                })
                }

              </div>
            </>
          )}

          <div className="orphanage-details-content">
            <h1>{orphanage.name}</h1>
            <p>{orphanage.about}</p>

            <div className="map-container">
              <Map
                center={[orphanage.latitude, orphanage.longitude]}
                zoom={16}
                style={{ width: '100%', height: 280 }}
                dragging={false}
                touchZoom={false}
                zoomControl={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
              >
                <TileLayer
                  url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
                />
                <Marker interactive={false} icon={happyMapIcon} position={[orphanage.latitude, orphanage.longitude]} />
              </Map>

              <footer>
                <a target="_blank" rel="noopener noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${orphanage.latitude},${orphanage.longitude}`}>Ver rotas no Google Maps</a>
              </footer>
            </div>

            <hr />

            <h2>Instruções para visita</h2>
            <p>{orphanage.instructions}</p>

            <div className="open-details">
              <div className="hour">
                <FiClock size={32} color="#15B6D6" />
                Segunda à Sexta <br />
                {orphanage.opening_hours}
              </div>

              {orphanage.open_on_weekends ? (
                <div className="open-on-weekends">
                  <FiInfo size={32} color="#39CC83" />
                  Atendemos <br />
                  fim de semana
                </div>
              ) : (
                  <div className="open-on-weekends dont-open">
                    <FiInfo size={32} color="#ff669d" />
                    Não Atendemos <br />
                    fim de semana
                  </div>
                )}


            </div>

            <button type="button" className="contact-button">
              <FaWhatsapp size={20} color="#FFF" />
              Entrar em contato
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}