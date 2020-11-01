import React, { useCallback, useEffect, useState } from 'react'
import { ScrollView, View, StyleSheet, Switch, Text, TextInput, TouchableOpacity, Image } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Feather } from '@expo/vector-icons'
import { RectButton } from 'react-native-gesture-handler'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import api from '../../config/api'
import { ReloadInstructions } from 'react-native/Libraries/NewAppScreen'

interface Orphanage {
  id: number
  name: string
  about: string
  instructions: string
  opening_hours: string
  open_on_weekends: boolean
  images: string[]
}

type RouteParams = {
  SelectMapPosition: {
    coordinates: {
      latitude: number
      longitude: number
    }
  }
}

export default function OrphanageData() {
  const route = useRoute<RouteProp<RouteParams, 'SelectMapPosition'>>()
  const navigation = useNavigation()

  const [formData, setFormData] = useState<Orphanage>({} as Orphanage)

  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestCameraRollPermissionsAsync()
    if (status !== 'granted') {
      alert('Necessário permitir acesso às fotos para utilizar essa opção')
      return
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    })

    if (!result.cancelled) {
      let newImages

      if (formData.images) {
        newImages = [...formData.images, result.uri]
      } else {
        newImages = [result.uri]
      }

      setFormData({ ...formData, images: newImages })
    }
  }

  const handleChangeText = useCallback((name: string, value: string) => {
    setFormData({ ...formData, [name]: value })
  }, [formData])

  const handleSaveOrphanage = useCallback(async () => {
    try {

      const { coordinates } = route.params

      const data = new FormData()

      data.append('name', formData.name)
      data.append('about', formData.about)
      data.append('instructions', formData.instructions)
      data.append('opening_hours', formData.opening_hours)
      data.append('open_on_weekends', String(formData.open_on_weekends))
      data.append('latitude', String(coordinates.latitude))
      data.append('longitude', String(coordinates.longitude))

      if (formData.images) {
        formData.images.forEach((img, index) => {
          data.append('images', {
            name: `image_${index}.jpg`,
            type: 'image/jpg',
            uri: img
          } as any)
        })
      }

      const response = await api.post('orphanages', data)

      if (response.status !== 201) {
        alert('Erro ao cadastrar orfanato')
        return
      }


      navigation.navigate('OrphanagesMap')

    } catch (err) {
      alert(err)
    }

  }, [formData, route])

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 24 }}>
      <Text style={styles.title}>Dados</Text>

      <Text style={styles.label}>Nome</Text>
      <TextInput
        style={styles.input}
        value={formData.name}
        onChangeText={value => handleChangeText('name', value)}
      />

      <Text style={styles.label}>Sobre</Text>
      <TextInput
        style={[styles.input, { height: 110 }]}
        multiline
        value={formData.about}
        onChangeText={value => handleChangeText('about', value)}
      />

      <Text style={styles.label}>Fotos</Text>

      <View style={styles.uploadedImagesContainer}>

        {formData.images?.map(image => (
          <Image
            key={image}
            style={styles.uploadedImage}
            source={{ uri: image }} />
        ))}

      </View>

      <TouchableOpacity style={styles.imagesInput} onPress={handleAddImage}>
        <Feather name="plus" size={24} color="#15B6D6" />
      </TouchableOpacity>

      <Text style={styles.title}>Visitação</Text>

      <Text style={styles.label}>Instruções</Text>
      <TextInput
        style={[styles.input, { height: 110 }]}
        multiline
        value={formData.instructions}
        onChangeText={value => handleChangeText('instructions', value)}
      />

      <Text style={styles.label}>Horario de visitas</Text>
      <TextInput
        style={styles.input}
        value={formData.opening_hours}
        onChangeText={value => handleChangeText('opening_hours', value)}
      />

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Atende final de semana?</Text>
        <Switch
          thumbColor="#fff"
          trackColor={{ false: '#ccc', true: '#39CC83' }}
          value={formData.open_on_weekends}
          onValueChange={value => setFormData({ ...formData, open_on_weekends: value })}
        />
      </View>

      <RectButton style={styles.nextButton} onPress={handleSaveOrphanage}>
        <Text style={styles.nextButtonText}>Cadastrar</Text>
      </RectButton>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    color: '#5c8599',
    fontSize: 24,
    fontFamily: 'Nunito_700Bold',
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 0.8,
    borderBottomColor: '#D3E2E6'
  },

  label: {
    color: '#8fa7b3',
    fontFamily: 'Nunito_600SemiBold',
    marginBottom: 8,
  },

  comment: {
    fontSize: 11,
    color: '#8fa7b3',
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1.4,
    borderColor: '#d3e2e6',
    borderRadius: 20,
    height: 56,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 16,
    textAlignVertical: 'top',
  },

  uploadedImagesContainer: {
    flexDirection: 'row'
  },

  uploadedImage: {
    width: 64,
    height: 64,
    borderRadius: 28,
    marginBottom: 32,
    marginRight: 8
  },

  imagesInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderStyle: 'dashed',
    borderColor: '#96D2F0',
    borderWidth: 1.4,
    borderRadius: 20,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  nextButton: {
    backgroundColor: '#15c3d6',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    marginTop: 32,
  },

  nextButtonText: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 16,
    color: '#FFF',
  }
})