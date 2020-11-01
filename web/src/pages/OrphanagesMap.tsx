import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FiArrowRight, FiPlus } from 'react-icons/fi'
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'

import mapMarkerImg from '../images/map-marker.svg'
import mapIcon from '../utils/mapIcon'

import '../styles/pages/orphanages-map.css'
import api from '../config/api'

interface OrphanageProps {
  id: number
  name: string
  latitude: number
  longitude: number
}

function OrphanagesMap() {
  const [orphanages, setOrphanages] = useState<OrphanageProps[]>([])

  useEffect(() => {
    async function fetchOrphanages() {
      const response = await api.get('orphanages')

      setOrphanages(response.data)
    }

    fetchOrphanages()
  }, [])

  return (
    <div id="page-map">
      <aside>
        <header>
          <img src={mapMarkerImg} alt="Happy" />

          <h2>Escolha um orfanato no mapa</h2>
          <p>Muitas crianças estão esperando a sua visita :)</p>
        </header>
      </aside>

      <Map
        center={[-20.629662, -49.6503516]}
        zoom={15}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`} />

        {orphanages.map(orph => (
          <Marker
            key={orph.id}
            icon={mapIcon}
            position={[orph.latitude, orph.longitude]}
          >
            <Popup closeButton={false} minWidth={240} maxWidth={240} className="map-popup">
              {orph.name}
              <Link to={`orphanages/${orph.id}`}>
                <FiArrowRight size={20} color="#FFF" />
              </Link>
            </Popup>

          </Marker>
        ))}


      </Map>

      <Link to="/orphanages/create" className="create-orphanage">
        <FiPlus size={32} color="#FFF" />
      </Link>

    </div>
  )
}

export default OrphanagesMap