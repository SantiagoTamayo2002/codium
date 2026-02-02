import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';

export default function RankingScreen({ apiUrl, token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRanking();
  }, []);

  const fetchRanking = async () => {
    try {
      const response = await fetch(`${apiUrl}/personas?per_page=50`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        // Ordenamos por puntaje de mayor a menor
        const sorted = data.sort((a, b) => b.puntaje_total - a.puntaje_total);
        setUsers(sorted);
      }
    } catch (error) {
      console.error("Error ranking:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => {
    // Colores para los top 3
    let rankColor = '#334155';
    let icon = `#${index + 1}`;
    
    if (index === 0) { rankColor = 'rgba(255, 215, 0, 0.2)'; icon = '🥇'; } // Oro
    if (index === 1) { rankColor = 'rgba(192, 192, 192, 0.2)'; icon = '🥈'; } // Plata
    if (index === 2) { rankColor = 'rgba(205, 127, 50, 0.2)'; icon = '🥉'; } // Bronce

    return (
      <View style={[styles.card, { backgroundColor: rankColor, borderColor: index < 3 ? '#F8FAFC' : '#334155' }]}>
        <Text style={styles.rankPosition}>{icon}</Text>
        <View style={styles.info}>
          <Text style={styles.username}>{item.nombre_usuario || item.nombre}</Text>
          <Text style={styles.stats}>{item.num_retos_resueltos} Retos • {item.id_rol === 1 ? 'Admin' : 'Estudiante'}</Text>
        </View>
        <Text style={styles.score}>{item.puntaje_total} pts</Text>
      </View>
    );
  };

  if (loading) return <ActivityIndicator style={{marginTop: 50}} size="large" color="#00CFFF" />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tabla de Clasificación 🏆</Text>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id_persona.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0F172A' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20, textAlign: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', padding: 15, marginBottom: 10, borderRadius: 12, borderWidth: 1 },
  rankPosition: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', width: 50, textAlign: 'center' },
  info: { flex: 1, paddingHorizontal: 10 },
  username: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  stats: { fontSize: 12, color: '#94A3B8' },
  score: { fontSize: 18, fontWeight: 'bold', color: '#00CFFF' }
});