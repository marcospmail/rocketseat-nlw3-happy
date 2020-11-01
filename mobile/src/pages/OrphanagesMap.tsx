import React, { useCallback, useState } from 'react'
import { StyleSheet, View, Dimensions, Text } from 'react-native'
import { useNavigation, useFocusEffect } from '@react-navigation/native'
import MapView, { PROVIDER_GOOGLE, Marker, Callout } from 'react-native-maps'
import { Feather } from '@expo/vector-icons'
import { useFonts } from 'expo-font'
import { Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from '@expo-google-fonts/nunito'

import mapMarker from '../images/map-marker.png'
import { RectButton } from 'react-native-gesture-handler'
import api from '../config/api'

interface Orphanage {
  id: number
  name: string
  latitude: number
  longitude: number
  about: string
  instructions: string
  opening_hours: string
  open_on_weekends: boolean
  images: Array<{
    path: string
  }>
}

const OrphanagesMap: React.FC = ({ }) => {
  const navigation = useNavigation()

  const [orphanages, setOrphanages] = useState<Orphanage[]>([])

  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold
  })

  useFocusEffect(() => {
    async function fetchOrphanages() {
      const response = await api.get('orphanages')
      setOrphanages(response.data)
    }

    fetchOrphanages()
  })

  const handleGoToOrphanageDetails = useCallback((id: number) => {
    navigation.navigate('OrphanageDetails', { id })
  }, [])

  const handleGoToCreateOrphanage = useCallback(() => {
    navigation.navigate('SelectMapPosition')
  }, [])

  if (!fontsLoaded) return null

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: -20.626310,
          longitude: -49.655967,
          latitudeDelta: 0.008,
          longitudeDelta: 0.008
        }}
      >

        {orphanages.map(orphanage => (
          <Marker
            key={orphanage.id}
            icon={mapMarker}
            calloutAnchor={{
              x: 2.7,
              y: 0.8
            }}
            coordinate={{
              latitude: orphanage.latitude,
              longitude: orphanage.longitude,
            }}>

            <Callout tooltip onPress={() => handleGoToOrphanageDetails(orphanage.id)}>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutText}>{orphanage.name}</Text>
              </View>
            </Callout>

          </Marker>

        ))}

      </MapView>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{orphanages.length} orfanato(s) encontrado(s)</Text>

        <RectButton style={styles.createOrphanageButton} onPress={handleGoToCreateOrphanage}>
          <Feather name="plus" size={20} color="#FFF" />
        </RectButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height
  },
  calloutContainer: {
    width: 160,
    height: 46,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 16,
    justifyContent: 'center'
  },
  calloutText: {
    color: '#0089a5',
    fontFamily: 'Nunito_700Bold',
    fontSize: 14
  },
  footer: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 32,
    backgroundColor: '#fff',
    borderRadius: 20,
    height: 56,
    paddingLeft: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 3
  },
  footerText: {
    color: '#8fa7b3',
    fontFamily: 'Nunito_700Bold',
  },
  createOrphanageButton: {
    width: 56,
    height: 56,
    backgroundColor: '#15c3d6',
    borderRadius: 20,

    justifyContent: 'center',
    alignItems: 'center'
  }
});


export default OrphanagesMap