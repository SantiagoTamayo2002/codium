import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, FlatList, ActivityIndicator, 
  RefreshControl, TouchableOpacity, Modal, TextInput, Alert, KeyboardAvoidingView, Platform 
} from 'react-native';

export default function FeedScreen({ apiUrl, token }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // --- ESTADOS: COMENTARIOS ---
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [sendingComment, setSendingComment] = useState(false);

  // --- ESTADOS: NUEVA PUBLICACIÓN (NUEVO) ---
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [sendingPost, setSendingPost] = useState(false);

  // --- 1. OBTENER PUBLICACIONES ---
  const fetchPosts = async () => {
    try {
      const response = await fetch(`${apiUrl}/publicaciones/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (response.ok) {
        const formattedPosts = data.map(p => ({
          ...p,
          likedByMe: p.liked_by_me,
          likes: p.likes || 0,
          commentsCount: p.num_comentarios || 0 
        }));
        setPosts(formattedPosts);
      }
    } catch (error) {
      console.error("Error red:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // --- 2. LOGICA LIKE ---
  const handleLike = async (id_publicacion, index) => {
    const newPosts = [...posts];
    const isLiked = newPosts[index].likedByMe;
    newPosts[index].likedByMe = !isLiked;
    newPosts[index].likes = isLiked ? (newPosts[index].likes - 1) : (newPosts[index].likes + 1);
    setPosts(newPosts);

    try {
      const method = isLiked ? 'DELETE' : 'POST';
      await fetch(`${apiUrl}/publicaciones/${id_publicacion}/reacciones`, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id_tipo_reaccion: 1 })
      });
    } catch (error) {
      fetchPosts(); 
    }
  };

  // --- 3. LOGICA COMENTARIOS ---
  const openCommentModal = async (id_publicacion) => {
    setSelectedPostId(id_publicacion);
    setCommentText('');
    setCommentModalVisible(true);
    setCommentsList([]);
    setLoadingComments(true);

    try {
      const response = await fetch(`${apiUrl}/publicaciones/${id_publicacion}/comentarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setCommentsList(await response.json());
      }
    } catch (error) { console.error(error); } 
    finally { setLoadingComments(false); }
  };

  const handleSendComment = async () => {
    if (!commentText.trim()) return;
    setSendingComment(true);
    try {
      const response = await fetch(`${apiUrl}/publicaciones/${selectedPostId}/comentarios`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ contenido: commentText })
      });
      if (response.ok) {
        setCommentText('');
        openCommentModal(selectedPostId); 
        fetchPosts(); 
      } else { Alert.alert("Error", "No se pudo comentar"); }
    } catch (error) { Alert.alert("Error", "Fallo de conexión"); } 
    finally { setSendingComment(false); }
  };

  // --- 4. LOGICA CREAR PUBLICACIÓN (NUEVO) ---
  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      return Alert.alert("Ups", "Escribe algo antes de publicar.");
    }
    setSendingPost(true);

    try {
      // Usamos la ruta POST /api/publicaciones/ definida en tu controlador
      const response = await fetch(`${apiUrl}/publicaciones/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contenido: newPostContent })
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("¡Publicado!", "Tu experiencia ha sido compartida.");
        setCreateModalVisible(false); // Cerrar modal
        setNewPostContent('');        // Limpiar texto
        setLoading(true);             // Mostrar carga
        fetchPosts();                 // Recargar muro
      } else {
        Alert.alert("Error", data.error || "No se pudo publicar");
      }
    } catch (error) {
      Alert.alert("Error", "Fallo de conexión con el servidor");
    } finally {
      setSendingPost(false);
    }
  };

  // --- RENDERIZADO ---
  const renderPost = ({ item, index }) => (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}><Text style={styles.avatarText}>👤</Text></View>
        <View>
          <Text style={styles.author}>{item.nombre_usuario || "Usuario"}</Text>
          <Text style={styles.date}>{new Date(item.fecha).toLocaleDateString()}</Text>
        </View>
      </View>
      <Text style={styles.content}>{item.contenido}</Text>
      <View style={styles.footer}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleLike(item.id_publicacion, index)}>
          <Text style={[styles.actionIcon, item.likedByMe && styles.likedIcon]}>{item.likedByMe ? '❤️' : '🤍'}</Text>
          <Text style={[styles.actionText, item.likedByMe && styles.likedText]}>{item.likes || 0}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => openCommentModal(item.id_publicacion)}>
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionText}>{item.commentsCount} {item.commentsCount === 1 ? 'Comentario' : 'Comentarios'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER CON BOTÓN DE CREAR (MODIFICADO) */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Muro Social 🌎</Text>
        <TouchableOpacity style={styles.createButton} onPress={() => setCreateModalVisible(true)}>
          <Text style={styles.createButtonText}>+ Publicar</Text>
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <ActivityIndicator size="large" color="#00CFFF" style={{marginTop: 50}} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id_publicacion.toString()}
          renderItem={renderPost}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); fetchPosts();}} tintColor="#00CFFF"/>}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={<Text style={styles.empty}>Sé el primero en publicar algo.</Text>}
        />
      )}

      {/* --- MODAL 1: COMENTARIOS --- */}
      <Modal animationType="slide" transparent={true} visible={commentModalVisible} onRequestClose={() => setCommentModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity onPress={() => setCommentModalVisible(false)}><Text style={styles.closeText}>✕</Text></TouchableOpacity>
            </View>
            {loadingComments ? <ActivityIndicator color="#00CFFF" style={{margin: 20}} /> : 
              <FlatList 
                data={commentsList} keyExtractor={(item, index) => index.toString()} 
                renderItem={({ item }) => (
                  <View style={styles.commentItem}>
                    <Text style={styles.commentAuthor}>{item.nombre_usuario}:</Text>
                    <Text style={styles.commentContent}>{item.contenido}</Text>
                  </View>
                )}
                style={styles.commentsList} ListEmptyComponent={<Text style={styles.emptyComments}>Sin comentarios aún.</Text>}
              />
            }
            <View style={styles.inputContainer}>
              <TextInput style={styles.miniInput} placeholder="Escribe un comentario..." placeholderTextColor="#94A3B8" value={commentText} onChangeText={setCommentText} />
              <TouchableOpacity style={styles.sendIconBtn} onPress={handleSendComment} disabled={sendingComment}>
                {sendingComment ? <ActivityIndicator size="small" color="#FFF"/> : <Text style={styles.sendIcon}>➤</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL 2: CREAR PUBLICACIÓN (NUEVO) --- */}
      <Modal animationType="fade" transparent={true} visible={createModalVisible} onRequestClose={() => setCreateModalVisible(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.fullScreenModalOverlay}>
          <View style={styles.createPostCard}>
            <Text style={styles.createPostTitle}>Comparte tu experiencia 🚀</Text>
            
            <TextInput
              style={styles.bigInput}
              placeholder="¿Qué reto resolviste hoy? ¿Qué aprendiste?"
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              value={newPostContent}
              onChangeText={setNewPostContent}
            />

            <View style={styles.createPostButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.publishBtn} onPress={handleCreatePost} disabled={sendingPost}>
                {sendingPost ? <ActivityIndicator color="#0F172A" /> : <Text style={styles.publishText}>Publicar</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0F172A' },
  
  // Header Nuevo
  headerContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC' },
  createButton: { backgroundColor: '#00CFFF', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  createButtonText: { color: '#0F172A', fontWeight: 'bold', fontSize: 14 },

  card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#334155', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  author: { fontWeight: 'bold', color: '#F8FAFC', fontSize: 16 },
  date: { color: '#94A3B8', fontSize: 12 },
  content: { color: '#E2E8F0', fontSize: 15, lineHeight: 22, marginBottom: 15 },
  footer: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 10, gap: 20 },
  actionButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionIcon: { fontSize: 18 },
  actionText: { color: '#94A3B8', fontWeight: '600', fontSize: 14 },
  likedIcon: { color: '#EF4444' },
  likedText: { color: '#EF4444' },
  empty: { color: '#64748B', textAlign: 'center', marginTop: 50 },

  // Estilos Modal Comentarios
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContainer: { height: '80%', backgroundColor: '#1E293B', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155', paddingBottom: 10 },
  modalTitle: { color: '#F8FAFC', fontSize: 18, fontWeight: 'bold' },
  closeText: { color: '#94A3B8', fontSize: 24, fontWeight: 'bold' },
  commentsList: { flex: 1, marginBottom: 10 },
  commentItem: { backgroundColor: '#0F172A', padding: 10, borderRadius: 8, marginBottom: 8 },
  commentAuthor: { color: '#00CFFF', fontWeight: 'bold', marginBottom: 2, fontSize: 12 },
  commentContent: { color: '#E2E8F0', fontSize: 14 },
  emptyComments: { color: '#64748B', textAlign: 'center', marginTop: 20, fontStyle: 'italic' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#334155' },
  miniInput: { flex: 1, backgroundColor: '#0F172A', color: '#FFF', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, borderWidth: 1, borderColor: '#334155' },
  sendIconBtn: { backgroundColor: '#00CFFF', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  sendIcon: { color: '#0F172A', fontSize: 18, fontWeight: 'bold' },

  // --- ESTILOS MODAL CREAR POST ---
  fullScreenModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', padding: 20 },
  createPostCard: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#334155' },
  createPostTitle: { fontSize: 20, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20, textAlign: 'center' },
  bigInput: { backgroundColor: '#0F172A', color: '#FFF', borderRadius: 12, padding: 15, height: 150, textAlignVertical: 'top', borderWidth: 1, borderColor: '#334155', marginBottom: 20, fontSize: 16 },
  createPostButtons: { flexDirection: 'row', gap: 15 },
  cancelBtn: { flex: 1, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: '#475569', alignItems: 'center' },
  cancelText: { color: '#94A3B8', fontWeight: 'bold' },
  publishBtn: { flex: 1, backgroundColor: '#00CFFF', padding: 15, borderRadius: 12, alignItems: 'center' },
  publishText: { color: '#0F172A', fontWeight: 'bold' }
});