import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import FeedScreen from './FeedScreen';     // Asegúrate que la ruta sea correcta
import RetosScreen from './RetosScreen';   // Asegúrate que la ruta sea correcta

export default function MainTabScreen({ apiUrl, token }) {
  // 'feed' o 'retos'
  const [currentTab, setCurrentTab] = useState('feed');

  return (
    <SafeAreaView style={styles.container}>
      
      {/* 1. CONTENIDO PRINCIPAL CAMBIANTE */}
      <View style={styles.content}>
        {currentTab === 'feed' ? (
          <FeedScreen apiUrl={apiUrl} token={token} />
        ) : (
          <RetosScreen apiUrl={apiUrl} token={token} />
        )}
      </View>

      {/* 2. BARRA DE NAVEGACIÓN INFERIOR */}
      <View style={styles.bottomBar}>
        
        {/* Botón Feed */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setCurrentTab('feed')}
        >
          <Text style={[styles.tabIcon, currentTab === 'feed' && styles.activeIcon]}>🏠</Text>
          <Text style={[styles.tabText, currentTab === 'feed' && styles.activeText]}>Muro</Text>
        </TouchableOpacity>

        {/* Botón Retos */}
        <TouchableOpacity 
          style={styles.tabButton} 
          onPress={() => setCurrentTab('retos')}
        >
          <Text style={[styles.tabIcon, currentTab === 'retos' && styles.activeIcon]}>🏆</Text>
          <Text style={[styles.tabText, currentTab === 'retos' && styles.activeText]}>Retos</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  content: { flex: 1 }, // Toma todo el espacio excepto la barra
  
  bottomBar: {
    flexDirection: 'row',
    height: 70,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 10 // Un poco de padding para móviles con gesto inferior
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    flex: 1
  },
  tabIcon: {
    fontSize: 24,
    color: '#64748B',
    marginBottom: 4
  },
  tabText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600'
  },
  // Estilos Activos
  activeIcon: {
    color: '#00CFFF'
  },
  activeText: {
    color: '#00CFFF'
  }
});