import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, Text, View, TouchableOpacity, SafeAreaView, Platform, ScrollView, RefreshControl 
} from 'react-native';

// --- IMPORTACIONES DE PANTALLAS ---
import RankingScreen from './RankingScreen';
import FeedScreen from './FeedScreen';
import RetosScreen from './RetosScreen'; // <--- Nueva importación

// --- COMPONENTE 1: MAPA DE CALOR (HEATMAP) ---
const MonthlyHeatmap = ({ activityMap }) => {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }

  const getColor = (count) => {
    if (!count) return '#1E293B'; 
    if (count === 1) return '#0e4a5c'; 
    if (count <= 3) return '#007ea7'; 
    return '#00CFFF'; 
  };

  return (
    <View style={styles.calendarContainer}>
      <View style={styles.calendarHeader}>
        <Text style={styles.sectionTitle}>Actividad (30 días)</Text>
        <Text style={styles.legendText}>Menos ■ ■ ■ ■ Más</Text> 
      </View>
      <View style={styles.heatmapGrid}>
        {days.map((date, index) => {
          const dateStr = date.toISOString().split('T')[0];
          const count = activityMap ? activityMap[dateStr] || 0 : 0;
          return (
            <View key={index} style={styles.dayContainer}>
               <View style={[styles.heatSquare, { backgroundColor: getColor(count) }]} />
               {count > 0 && (
                 <View style={styles.miniTooltip}><Text style={styles.tooltipText}>{count}</Text></View>
               )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

// --- COMPONENTE 2: DASHBOARD (PANTALLA DE INICIO) ---
function Dashboard({ userData, onRefresh }) {
  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={false} onRefresh={onRefresh} tintColor="#00CFFF"/>}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Hola, Hacker 👨‍💻</Text>
          <Text style={styles.username}>{userData?.nombre_usuario || "Usuario"}</Text>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.fireIcon}>🔥</Text>
          <Text style={styles.streakNumber}>{userData?.racha_actual || 0}</Text>
        </View>
      </View>

      <View style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData?.puntaje_total || 0}</Text>
          <Text style={styles.statLabel}>Puntos XP</Text>
        </View>
        <View style={styles.verticalLine} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userData?.num_retos_resueltos || 0}</Text>
          <Text style={styles.statLabel}>Resueltos</Text>
        </View>
      </View>

      <MonthlyHeatmap activityMap={userData?.mapa_actividad || {}} />

      <TouchableOpacity style={styles.ctaButton}>
        <View>
          <Text style={styles.ctaTitle}>Entrenar Algoritmos</Text>
          <Text style={styles.ctaSubtitle}>Mejora tu lógica hoy</Text>
        </View>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// --- COMPONENTE PRINCIPAL: HOME SCREEN ---
export default function HomeScreen({ token, onLogout, apiUrl }) {
  const [userData, setUserData] = useState(null);
  // Estados: 'home', 'feed', 'retos', 'ranking'
  const [activeTab, setActiveTab] = useState('home');

  const fetchProfile = () => {
    fetch(`${apiUrl}/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => { if (data.id_persona) setUserData(data); })
    .catch(err => console.error(err));
  };

  useEffect(() => { fetchProfile(); }, []);

  // Función para renderizar el contenido según la pestaña seleccionada
  const renderContent = () => {
    switch (activeTab) {
      case 'home': return <Dashboard userData={userData} onRefresh={fetchProfile} />;
      case 'feed': return <FeedScreen apiUrl={apiUrl} token={token} />;
      case 'retos': return <RetosScreen apiUrl={apiUrl} token={token} />; // <--- Nueva Pantalla
      case 'ranking': return <RankingScreen apiUrl={apiUrl} token={token} />;
      default: return <Dashboard userData={userData} onRefresh={fetchProfile} />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* AREA DE CONTENIDO */}
      <View style={styles.contentContainer}>
        {renderContent()}
      </View>

      {/* BARRA DE NAVEGACIÓN INFERIOR (4 PESTAÑAS) */}
      <View style={styles.tabBar}>
        
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('home')}>
          <Text style={[styles.tabIcon, activeTab === 'home' && styles.activeTabColor]}>🏠</Text>
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabColor]}>Inicio</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('feed')}>
          <Text style={[styles.tabIcon, activeTab === 'feed' && styles.activeTabColor]}>📰</Text>
          <Text style={[styles.tabText, activeTab === 'feed' && styles.activeTabColor]}>Muro</Text>
        </TouchableOpacity>

        {/* NUEVO BOTÓN DE RETOS */}
        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('retos')}>
          <Text style={[styles.tabIcon, activeTab === 'retos' && styles.activeTabColor]}>🎯</Text>
          <Text style={[styles.tabText, activeTab === 'retos' && styles.activeTabColor]}>Retos</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => setActiveTab('ranking')}>
          <Text style={[styles.tabIcon, activeTab === 'ranking' && styles.activeTabColor]}>🏆</Text>
          <Text style={[styles.tabText, activeTab === 'ranking' && styles.activeTabColor]}>Ranking</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={onLogout}>
          <Text style={styles.tabIcon}>🚪</Text>
          <Text style={[styles.tabText, {color: '#EF4444'}]}>Salir</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A' },
  contentContainer: { flex: 1 },
  scrollContent: { padding: 24 },

  // Estilos Dashboard
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25, marginTop: 10 },
  greeting: { fontSize: 16, color: '#94A3B8' },
  username: { fontSize: 28, fontWeight: 'bold', color: '#F8FAFC' },
  streakBadge: { backgroundColor: 'rgba(255, 165, 0, 0.1)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255, 165, 0, 0.5)' },
  fireIcon: { fontSize: 18, marginRight: 5 },
  streakNumber: { color: 'orange', fontWeight: 'bold', fontSize: 18 },

  statsCard: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 16, padding: 20, marginBottom: 30, borderWidth: 1, borderColor: '#334155', justifyContent: 'space-around' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: 'bold', color: '#00CFFF' },
  statLabel: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  verticalLine: { width: 1, height: '100%', backgroundColor: '#334155' },

  // Heatmap
  calendarContainer: { marginBottom: 30, backgroundColor: '#1E293B', padding: 15, borderRadius: 16, borderWidth: 1, borderColor: '#334155' },
  calendarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#F8FAFC' },
  legendText: { fontSize: 10, color: '#64748B', letterSpacing: 2 },
  heatmapGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 6 },
  dayContainer: { position: 'relative' },
  heatSquare: { width: 26, height: 26, borderRadius: 4, marginBottom: 6 },
  miniTooltip: { position: 'absolute', top: -12, right: -5, backgroundColor: '#000', borderRadius: 5, paddingHorizontal: 4, zIndex: 10 },
  tooltipText: { color: '#FFF', fontSize: 8, fontWeight: 'bold' },

  ctaButton: { flexDirection: 'row', backgroundColor: 'rgba(0, 207, 255, 0.1)', padding: 20, borderRadius: 16, alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#00CFFF' },
  ctaTitle: { color: '#00CFFF', fontWeight: 'bold', fontSize: 18 },
  ctaSubtitle: { color: '#94A3B8', fontSize: 14 },
  ctaArrow: { color: '#00CFFF', fontSize: 24 },

  // Barra de Navegación
  tabBar: { flexDirection: 'row', backgroundColor: '#1E293B', height: 75, borderTopWidth: 1, borderTopColor: '#334155', paddingBottom: Platform.OS === 'ios' ? 20 : 5, paddingTop: 10, justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  tabIcon: { fontSize: 22, marginBottom: 4, color: '#64748B' },
  tabText: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  activeTabColor: { color: '#00CFFF' }
});