import React, { useState, useCallback, FormEvent } from "react";
import { Map, Marker, TileLayer } from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet'

import { FiPlus } from "react-icons/fi";

import mapIcon from '../utils/mapIcon'
import Sidebar from '../components/Sidebar'

import '../styles/pages/create-orphanage.css';
import api from "../config/api";
import { useHistory } from "react-router-dom";

interface FormDataProps {
  name: string
  about: string
  instructions: string
  opening_hours: string
  open_on_weekends: boolean
  images: File[]
}

export default function CreateOrphanage() {
  const history = useHistory()

  const [coordinates, setCoordinates] = useState({ latitude: 0, longitude: 0 })
  const [imagesPreviews, setImagesPreviews] = useState<string[]>([])
  const [formData, setFormData] = useState<FormDataProps>({
    name: '',
    about: '',
    instructions: '',
    opening_hours: '',
    open_on_weekends: true,
    images: []
  })

  const handleCoordinateChange = useCallback((event: LeafletMouseEvent) => {
    const { lat, lng } = event.latlng

    setCoordinates({
      latitude: lat,
      longitude: lng
    })

  }, [])

  const handleChangeOpenOnWeekends = useCallback(open => {
    setFormData(oldData => ({ ...oldData, open_on_weekends: open }))
  }, [])

  const handleFormDataChange = useCallback(e => {
    const { name, value } = e.target

    setFormData(oldData => ({ ...oldData, [name]: value }))
  }, [])



  const handleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target

    if (files) {
      const images = Array.from(files)

      setFormData(oldData => ({ ...oldData, images}))

      const imagesPreviews = images.map(f => URL.createObjectURL(f))
      setImagesPreviews(imagesPreviews)
    }
  }, [])

  const handleDeleteImage = useCallback((index: number) => {
    const newImagesPreviews = imagesPreviews.filter((img, imgIndex) => imgIndex !== index)
    setImagesPreviews(newImagesPreviews)

    const newImages = formData.images.filter((img, imgIndex) => imgIndex !== index)
    setFormData(oldData => ({ ...oldData, images: newImages }))
  }, [formData, imagesPreviews])

  const handleFormSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault()

    try {
      const data = new FormData()

      data.append('name', formData.name)
      data.append('about', formData.about)
      data.append('instructions', formData.instructions)
      data.append('opening_hours', formData.opening_hours)
      data.append('open_on_weekends', String(formData.open_on_weekends))
      data.append('latitude', String(coordinates.latitude))
      data.append('longitude', String(coordinates.longitude))

      formData.images.forEach(img => {
        data.append('images', img)
      })

      const response = await api.post('orphanages', data)

      if (response.status === 201) {
        alert('Orfanato criado!')
        history.push('/orphanages')
        return
      }

      alert('error')

    }
    catch (err) {
      alert(err)
    }
  }, [formData, coordinates, history])

  return (
    <div id="page-create-orphanage">
      <Sidebar />

      <main>
        <form className="create-orphanage-form" onSubmit={handleFormSubmit}>
          <fieldset>
            <legend>Dados</legend>

            <Map
              center={[-20.627781, -49.648107]}
              style={{ width: '100%', height: 280 }}
              zoom={15}
              onclick={handleCoordinateChange}
            >
              <TileLayer
                url={`https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
              />

              <Marker interactive={false} icon={mapIcon} position={[coordinates.latitude, coordinates.longitude]} />
            </Map>

            <div className="input-block">
              <label htmlFor="name">Nome</label>
              <input id="name" name="name" value={formData.name} onChange={handleFormDataChange} />
            </div>

            <div className="input-block">
              <label htmlFor="about">Sobre <span>Máximo de 300 caracteres</span></label>
              <textarea id="name" name="about" value={formData.about} onChange={handleFormDataChange} maxLength={300} />
            </div>

            <div className="input-block">
              <label htmlFor="images">Fotos</label>

              <div className="uploaded-image">
                {imagesPreviews.map((preview, index) => (
                  <div key={index} className="image-wrapper" >
                    <button type="button" className="delete-image" onClick={() => handleDeleteImage(index)}> X </button>
                    <img src={preview} alt="Preview" />
                  </div>
                ))}

                <label htmlFor="images[]" className="new-image">
                  <FiPlus size={24} color="#15b6d6" />
                </label>
              </div>

              <input id="images[]" type="file" multiple onChange={handleImagesChange} />
            </div>
          </fieldset>

          <fieldset>
            <legend>Visitação</legend>

            <div className="input-block">
              <label htmlFor="instructions">Instruções</label>
              <textarea id="instructions" name="instructions" value={formData.instructions} onChange={handleFormDataChange} />
            </div>

            <div className="input-block">
              <label htmlFor="opening_hours">Horário de funcionamento</label>
              <input id="opening_hours" name="opening_hours" value={formData.opening_hours} onChange={handleFormDataChange} />
            </div>

            <div className="input-block">
              <label htmlFor="open_on_weekends">Atende fim de semana</label>

              <div className="button-select">
                <button type="button" className={formData.open_on_weekends ? 'active' : ''} onClick={() => handleChangeOpenOnWeekends(true)}>Sim</button>
                <button type="button" className={!formData.open_on_weekends ? 'active dont-open' : ''} onClick={() => handleChangeOpenOnWeekends(false)}>Não</button>
              </div>
            </div>
          </fieldset>

          <button className="confirm-button" type="submit">
            Confirmar
          </button>
        </form>
      </main>
    </div>
  );
}
