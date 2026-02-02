import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, ScrollView, ActivityIndicator, Alert 
} from 'react-native';

export default function RetosScreen({ apiUrl, token }) {
  const [retos, setRetos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedReto, setSelectedReto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchRetos();
  }, []);

  const fetchRetos = async () => {
    try {
      // Llamamos a la ruta que usa tu modelo existente
      const response = await fetch(`${apiUrl}/retos/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();

      if (response.ok) {
        setRetos(data);
      } else {
        console.error("Error backend:", data);
      }
    } catch (error) {
      console.error("Error red:", error);
    } finally {
      setLoading(false);
    }
  };

  const openRetoDetails = (reto) => {
    setSelectedReto(reto);
    setModalVisible(true);
  };

  // Helper para el color de dificultad (maneja texto o ID si fuera necesario)
  const getDifficultyColor = (diff) => {
    if (!diff) return '#94A3B8'; // Gris por defecto
    const d = diff.toString().toLowerCase();
    if (d.includes('fácil') || d.includes('facil') || d === '1') return '#4ADE80'; // Verde
    if (d.includes('medio') || d === '2') return '#FACC15'; // Amarillo
    if (d.includes('difícil') || d.includes('dificil') || d === '3') return '#EF4444'; // Rojo
    return '#94A3B8';
  };

  const renderReto = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => openRetoDetails(item)}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        
        {/* Renderizado condicional de la etiqueta de dificultad */}
        {item.nombre_dificultad && (
          <View style={[styles.badge, { backgroundColor: getDifficultyColor(item.nombre_dificultad) + '33' }]}>
            <Text style={[styles.badgeText, { color: getDifficultyColor(item.nombre_dificultad) }]}>
              {item.nombre_dificultad}
            </Text>
          </View>
        )}
      </View>
      
      {/* Si tu modelo existente devuelve lenguajes, los mostramos, si no, texto genérico */}
      <Text style={styles.cardLang}>
        {item.lenguajes ? `Lenguajes: ${item.lenguajes}` : "Toca para ver detalles y lenguajes"}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Retos Disponibles 🏆</Text>

      {loading ? <ActivityIndicator size="large" color="#00CFFF" style={{marginTop: 50}} /> : (
        <FlatList
          data={retos}
          keyExtractor={(item) => (item.id_reto ? item.id_reto.toString() : Math.random().toString())}
          renderItem={renderReto}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay retos disponibles aún.</Text>}
        />
      )}

      {/* MODAL DE DETALLE */}
      <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedReto?.titulo}</Text>
            <View style={styles.separator} />
            
            <ScrollView style={{ maxHeight: 300 }}>
                <Text style={styles.modalLabel}>Descripción:</Text>
                <Text style={styles.modalText}>{selectedReto?.descripcion}</Text>
            </ScrollView>

            <View style={styles.infoBox}>
               <Text style={styles.infoLabel}>Disponibilidad:</Text>
               <Text style={styles.infoValue}>
                 {selectedReto?.lenguajes || "Consulta la versión web para ver los compiladores disponibles."}
               </Text>
            </View>
            
            <View style={styles.warningBox}>
                <Text style={styles.warningText}>⚠️ La resolución de código está habilitada solo en la versión Web de Escritorio.</Text>
            </View>

            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F172A', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  emptyText: { color: '#64748B', textAlign: 'center', marginTop: 50, fontSize: 16 },
  
  card: { backgroundColor: '#1E293B', padding: 15, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold', flex: 1, marginRight: 10 },
  cardLang: { color: '#94A3B8', fontSize: 14 },
  
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#00CFFF', textAlign: 'center', marginBottom: 10 },
  separator: { height: 1, backgroundColor: '#334155', marginBottom: 15 },
  modalLabel: { color: '#94A3B8', fontWeight: 'bold', marginBottom: 5 },
  modalText: { color: '#E2E8F0', fontSize: 16, lineHeight: 24, marginBottom: 20 },
  infoBox: { backgroundColor: '#0F172A', padding: 10, borderRadius: 8, marginBottom: 15 },
  infoLabel: { color: '#94A3B8', fontSize: 12 },
  infoValue: { color: '#FFF', fontWeight: 'bold' },
  warningBox: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 10, borderRadius: 8, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
  warningText: { color: '#EF4444', fontSize: 13, textAlign: 'center' },
  closeBtn: { backgroundColor: '#334155', padding: 15, borderRadius: 12, alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontWeight: 'bold' }
});