import { useEffect, useState } from "react";
import api from "../services/api";
import { FaThumbsUp, FaHeart, FaSurprise, FaLaugh } from "react-icons/fa";
import "../css/Publicaciones.css";

export default function Publicaciones({ currentUserId }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newContent, setNewContent] = useState("");

  const fetchPosts = async () => {
    try {
      const res = await api.get("/publicaciones?page=1&per_page=10");
      setPosts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  const handleReaction = async (id_post, tipo) => {
    try {
      await api.post("/publicaciones/reaccion", {
        id_persona: currentUserId,
        id_publicacion: id_post,
        id_tipo_reaccion: tipo,
      });
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  const handleCreatePost = async () => {
    if (!newContent) return;
    try {
      await api.post("/publicaciones/", { id_persona: currentUserId, contenido: newContent });
      setNewContent("");
      fetchPosts();
    } catch (err) { console.error(err); }
  };

  if (loading) return <p>Cargando publicaciones...</p>;

  return (
    <div className="feed-container">
      <div className="new-post">
        <textarea
          placeholder="¿Qué quieres compartir?"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
        />
        <button onClick={handleCreatePost}>Publicar</button>
      </div>

      {posts.map((post) => (
        <div className="post-card" key={post.id_publicacion}>
          <div className="post-header">
            <span className="author">{post.nombre_usuario}</span>
            <span className="date">{new Date(post.fecha).toLocaleString()}</span>
          </div>
          <div className="post-content">{post.contenido}</div>
          <div className="post-actions">
            <button onClick={() => handleReaction(post.id_publicacion, 1)}><FaThumbsUp /></button>
            <button onClick={() => handleReaction(post.id_publicacion, 2)}><FaHeart /></button>
            <button onClick={() => handleReaction(post.id_publicacion, 3)}><FaSurprise /></button>
            <button onClick={() => handleReaction(post.id_publicacion, 4)}><FaLaugh /></button>
          </div>
        </div>
      ))}
    </div>
  );
}
