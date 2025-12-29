"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { supabase } from "@/lib/supabaseClient";
import { 
  Plus, 
  FileText, 
  Trash2, 
  Calendar,
  User,
  Edit3,
  Save,
  X,
  Video,
  CheckCircle2
} from "lucide-react";
import { RichTextEditor } from "@/components/editors/RichTextEditor";

interface Script {
  id: number;
  title: string;
  content: string;
  client_id?: number;
  mandat_id?: number;
  editorial_post_id?: number;
  created_at: string;
  updated_at: string;
  client?: {
    id: number;
    name: string;
  };
  mandat?: {
    id: number;
    title: string;
  };
  editorial_post?: {
    id: number;
    title: string;
    publication_date: string;
    platform: string;
  };
}

interface Client {
  id: number;
  name: string;
}

interface Mandat {
  id: number;
  title: string;
  client_id: number;
}

interface EditorialPost {
  id: number;
  calendar_id: number;
  title: string;
  publication_date: string;
  platform: string;
  content_type: string | null;
  status: string;
}

interface EditorialCalendar {
  id: number;
  strategy_id: number;
  name: string | null;
}

interface Strategy {
  id: number;
  client_id: number;
}

export default function ScriptsPage() {
  const router = useRouter();
  const [scripts, setScripts] = useState<Script[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [mandats, setMandats] = useState<Mandat[]>([]);
  const [editorialPosts, setEditorialPosts] = useState<EditorialPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedScript, setSelectedScript] = useState<Script | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorClientId, setEditorClientId] = useState<string>("");
  const [editorMandatId, setEditorMandatId] = useState<string>("");
  const [editorPostId, setEditorPostId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostDate, setNewPostDate] = useState("");
  const [newPostPlatform, setNewPostPlatform] = useState("Instagram");
  const [newPostType, setNewPostType] = useState("Vidéos courtes (Reels/Shorts)");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [scriptsRes, clientsRes, mandatsRes] = await Promise.all([
        supabase
          .from("video_script")
          .select(`
            *,
            client:client_id (id, name),
            mandat:mandat_id (id, title),
            editorial_post:editorial_post_id (id, title, publication_date, platform)
          `)
          .order("updated_at", { ascending: false }),
        supabase.from("client").select("id, name").order("name"),
        supabase.from("mandat").select("id, title, client_id").order("title")
      ]);

      if (scriptsRes.data) setScripts(scriptsRes.data as Script[]);
      if (clientsRes.data) setClients(clientsRes.data);
      if (mandatsRes.data) setMandats(mandatsRes.data);
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewScript = () => {
    setSelectedScript(null);
    setEditorTitle("");
    setEditorContent("");
    setEditorClientId("");
    setEditorMandatId("");
    setEditorPostId("");
    setShowEditor(true);
  };

  const handleEditScript = async (script: Script) => {
    setSelectedScript(script);
    setEditorTitle(script.title);
    setEditorContent(script.content);
    setEditorClientId(script.client_id?.toString() || "");
    setEditorMandatId(script.mandat_id?.toString() || "");
    setEditorPostId(script.editorial_post_id?.toString() || "");
    
    if (script.client_id) {
      await loadEditorialPosts(script.client_id);
    }
    
    setShowEditor(true);
  };

  const loadEditorialPosts = async (clientId: number) => {
    try {
      // Récupérer les stratégies du client
      const { data: strategies } = await supabase
        .from("social_media_strategy")
        .select("id")
        .eq("client_id", clientId);

      if (!strategies || strategies.length === 0) {
        setEditorialPosts([]);
        return;
      }

      const strategyIds = strategies.map(s => s.id);

      // Récupérer les calendriers de ces stratégies
      const { data: calendars } = await supabase
        .from("editorial_calendar")
        .select("id")
        .in("strategy_id", strategyIds);

      if (!calendars || calendars.length === 0) {
        setEditorialPosts([]);
        return;
      }

      const calendarIds = calendars.map(c => c.id);

      // Récupérer les posts de type vidéo
      const { data: posts } = await supabase
        .from("editorial_post")
        .select("id, calendar_id, title, publication_date, platform, content_type, status")
        .in("calendar_id", calendarIds)
        .or('content_type.ilike.%vidéo%,content_type.ilike.%video%,content_type.ilike.%reel%,content_type.ilike.%short%')
        .order("publication_date", { ascending: false });

      setEditorialPosts(posts || []);
    } catch (error) {
      console.error("Erreur chargement posts:", error);
      setEditorialPosts([]);
    }
  };

  const handleSaveScript = async () => {
    if (!editorTitle.trim()) {
      alert("Le titre est requis");
      return;
    }

    setIsSaving(true);
    try {
      const scriptData = {
        title: editorTitle.trim(),
        content: editorContent,
        client_id: editorClientId ? parseInt(editorClientId) : null,
        mandat_id: editorMandatId ? parseInt(editorMandatId) : null,
        editorial_post_id: editorPostId ? parseInt(editorPostId) : null,
        updated_at: new Date().toISOString()
      };

      if (selectedScript) {
        const { error } = await supabase
          .from("video_script")
          .update(scriptData)
          .eq("id", selectedScript.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("video_script")
          .insert({ ...scriptData, created_at: new Date().toISOString() });

        if (error) throw error;
      }

      await loadData();
      setShowEditor(false);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteScript = async (id: number) => {
    if (!confirm("Supprimer ce script ?")) return;

    try {
      const { error } = await supabase
        .from("video_script")
        .delete()
        .eq("id", id);

      if (error) throw error;
      await loadData();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  const filteredMandats = editorClientId
    ? mandats.filter(m => m.client_id === parseInt(editorClientId))
    : [];

  const handleClientChange = async (clientId: string) => {
    setEditorClientId(clientId);
    setEditorMandatId("");
    setEditorPostId("");
    if (clientId) {
      await loadEditorialPosts(parseInt(clientId));
    } else {
      setEditorialPosts([]);
    }
  };

  const handleCreateNewPost = async () => {
    if (!editorClientId || !newPostTitle.trim() || !newPostDate) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      // Récupérer ou créer la stratégie du client
      let { data: strategies } = await supabase
        .from("social_media_strategy")
        .select("id")
        .eq("client_id", parseInt(editorClientId))
        .eq("status", "actif")
        .limit(1);

      let strategyId: number;

      if (!strategies || strategies.length === 0) {
        // Créer une stratégie par défaut
        const { data: newStrategy, error: stratError } = await supabase
          .from("social_media_strategy")
          .insert({
            client_id: parseInt(editorClientId),
            status: "actif",
            version: 1
          })
          .select()
          .single();

        if (stratError) throw stratError;
        strategyId = newStrategy.id;
      } else {
        strategyId = strategies[0].id;
      }

      // Récupérer ou créer le calendrier éditorial
      let { data: calendars } = await supabase
        .from("editorial_calendar")
        .select("id")
        .eq("strategy_id", strategyId)
        .limit(1);

      let calendarId: number;

      if (!calendars || calendars.length === 0) {
        const { data: newCalendar, error: calError } = await supabase
          .from("editorial_calendar")
          .insert({
            strategy_id: strategyId,
            name: "Calendrier éditorial"
          })
          .select()
          .single();

        if (calError) throw calError;
        calendarId = newCalendar.id;
      } else {
        calendarId = calendars[0].id;
      }

      // Créer le post
      const { data: newPost, error: postError } = await supabase
        .from("editorial_post")
        .insert({
          calendar_id: calendarId,
          title: newPostTitle.trim(),
          publication_date: newPostDate,
          platform: newPostPlatform,
          content_type: newPostType,
          status: "draft",
          likes: 0,
          comments: 0,
          shares: 0,
          views: 0,
          reach: 0
        })
        .select()
        .single();

      if (postError) throw postError;

      // Mettre à jour la liste des posts
      await loadEditorialPosts(parseInt(editorClientId));
      
      // Sélectionner le post créé
      setEditorPostId(newPost.id.toString());
      
      // Réinitialiser le formulaire de création
      setNewPostTitle("");
      setNewPostDate("");
      setNewPostPlatform("Instagram");
      setNewPostType("Vidéos courtes (Reels/Shorts)");
      setShowCreatePost(false);

      alert("Vidéo créée et planifiée avec succès !");
    } catch (error) {
      console.error("Erreur création post:", error);
      alert("Erreur lors de la création de la vidéo");
    }
  };

  return (
    <>
      <Header title="Scripts Vidéo" />
      <main className="p-4 sm:p-6 lg:p-8 max-w-[1800px] mx-auto">
        {/* Header avec bouton nouveau script */}
        <div className="bg-gradient-to-br from-brand-orange via-brand-orange-light to-orange-400 rounded-2xl shadow-2xl p-6 sm:p-8 text-white mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">Scripts Vidéo</h1>
              <p className="text-white/90 text-lg">Créez et gérez vos scripts de vidéos</p>
            </div>
            <button
              onClick={handleNewScript}
              className="flex items-center gap-2 px-6 py-3 bg-white text-brand-orange rounded-xl font-bold hover:shadow-xl transition-all"
            >
              <Plus className="w-5 h-5" />
              Nouveau script
            </button>
          </div>
        </div>

        {/* Liste des scripts */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-orange border-t-transparent"></div>
          </div>
        ) : scripts.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun script</h3>
            <p className="text-gray-600 mb-6">Créez votre premier script vidéo</p>
            <button
              onClick={handleNewScript}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Plus className="w-5 h-5" />
              Nouveau script
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scripts.map((script) => (
              <div
                key={script.id}
                className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-brand-orange"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <FileText className="w-5 h-5 text-brand-orange" />
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg">{script.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditScript(script)}
                      className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit3 className="w-4 h-4 text-blue-600" />
                    </button>
                    <button
                      onClick={() => handleDeleteScript(script.id)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {script.client && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <User className="w-4 h-4" />
                    <span>{script.client.name}</span>
                  </div>
                )}

                {script.mandat && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <FileText className="w-4 h-4" />
                    <span>{script.mandat.title}</span>
                  </div>
                )}

                {script.editorial_post && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mb-2 font-semibold">
                    <Video className="w-4 h-4" />
                    <span>{script.editorial_post.title}</span>
                    <span className="text-xs text-gray-500">({new Date(script.editorial_post.publication_date).toLocaleDateString('fr-FR')} - {script.editorial_post.platform})</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                  <Calendar className="w-3 h-3" />
                  <span>Modifié le {new Date(script.updated_at).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal Éditeur */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-brand-orange to-brand-orange-light p-6 border-b-4 border-brand-orange">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedScript ? "Modifier le script" : "Nouveau script"}
                    </h2>
                    <p className="text-white/90 text-sm mt-1">Éditeur de texte riche</p>
                  </div>
                  <button
                    onClick={() => setShowEditor(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Form */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">
                      Titre du script *
                    </label>
                    <input
                      type="text"
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                      placeholder="Ex: Script Instagram - Lancement produit"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Client
                      </label>
                      <select
                        value={editorClientId}
                        onChange={(e) => handleClientChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                      >
                        <option value="">Aucun client</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Mandat
                      </label>
                      <select
                        value={editorMandatId}
                        onChange={(e) => setEditorMandatId(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-gray-900 font-medium"
                        disabled={!editorClientId}
                      >
                        <option value="">Aucun mandat</option>
                        {filteredMandats.map(mandat => (
                          <option key={mandat.id} value={mandat.id}>{mandat.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Sélection de la vidéo planifiée */}
                {editorClientId && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-900">
                        <Video className="w-4 h-4 inline mr-2 text-green-600" />
                        Vidéo planifiée
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(true)}
                        className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" />
                        Créer une vidéo
                      </button>
                    </div>
                    
                    <select
                      value={editorPostId}
                      onChange={(e) => setEditorPostId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-500/20 text-gray-900 font-medium bg-white"
                    >
                      <option value="">Aucune vidéo liée</option>
                      {editorialPosts.map(post => (
                        <option key={post.id} value={post.id}>
                          {post.title} - {new Date(post.publication_date).toLocaleDateString('fr-FR')} ({post.platform})
                        </option>
                      ))}
                    </select>
                    
                    {editorialPosts.length === 0 && !showCreatePost && (
                      <p className="text-xs text-gray-600 mt-2">
                        Aucune vidéo planifiée pour ce client. Créez-en une pour lier ce script.
                      </p>
                    )}
                  </div>
                )}

                {/* Formulaire de création de vidéo */}
                {showCreatePost && editorClientId && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border-2 border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-gray-900">
                        <Video className="w-4 h-4 inline mr-2 text-blue-600" />
                        Créer une nouvelle vidéo planifiée
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowCreatePost(false)}
                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Titre de la vidéo *
                        </label>
                        <input
                          type="text"
                          value={newPostTitle}
                          onChange={(e) => setNewPostTitle(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                          placeholder="Ex: Reel Instagram - Nouveau produit"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Date de publication *
                          </label>
                          <input
                            type="date"
                            value={newPostDate}
                            onChange={(e) => setNewPostDate(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Plateforme
                          </label>
                          <select
                            value={newPostPlatform}
                            onChange={(e) => setNewPostPlatform(e.target.value)}
                            className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                          >
                            <option>Instagram</option>
                            <option>TikTok</option>
                            <option>Facebook</option>
                            <option>YouTube</option>
                            <option>LinkedIn</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                          Type de contenu
                        </label>
                        <select
                          value={newPostType}
                          onChange={(e) => setNewPostType(e.target.value)}
                          className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
                        >
                          <option>Vidéos courtes (Reels/Shorts)</option>
                          <option>Vidéos longues</option>
                          <option>Stories</option>
                          <option>Lives</option>
                        </select>
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleCreateNewPost}
                        className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Créer et lier la vidéo
                      </button>
                    </div>
                  </div>
                )}

                {/* Éditeur riche */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Contenu du script
                  </label>
                  <RichTextEditor
                    content={editorContent}
                    onChange={setEditorContent}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex gap-3 p-6 border-t-2 border-gray-200 bg-gray-50">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveScript}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-brand-orange to-brand-orange-light text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
