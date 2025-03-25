import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useAuth } from "../hooks/useAuth";
import Navbar from "./Navbar";
import { Loader2 } from "lucide-react";

const UserProfile: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<any>(null);
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { token } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserAndPosts = async () => {
            if (!token || !userId) {
                navigate("/login");
                return;
            }
            try {
                // Obter todos os posts e filtrar pelo usuário
                const postsResponse = await api.get("/admin/listAllPosts", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const userPosts = postsResponse.data.posts.filter(
                    (post: any) => post.author.id === userId
                );
                setPosts(userPosts);

                // Obter informações do usuário a partir do primeiro post (ou criar uma rota específica no backend)
                const userData = userPosts.length > 0 ? userPosts[0].author : null;
                if (userData) {
                    setUser(userData);
                } else {
                    setError("Usuário não encontrado ou sem postagens.");
                }
            } catch (err) {
                setError("Erro ao carregar dados do usuário.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserAndPosts();
    }, [token, userId, navigate]);

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-screen">
                <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="p-6 text-center text-red-500">
                {error || "Nenhum dado disponível para este usuário."}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Perfil do Usuário</h1>
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Informações do Usuário</h2>
                    <p><strong>Nome:</strong> {user.name || "Unnamed"}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Instituição:</strong> {user.institution?.title || "Sem instituição"}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Postagens do Usuário</h2>
                    {posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {posts.map((post) => (
                                <div key={post.id} className="rounded-lg bg-gray-50 p-4 shadow">
                                    <p className="font-medium">{post.title || "Interação"}</p>
                                    {post.imageUrl && (
                                        <img
                                            src={post.imageUrl}
                                            alt="Imagem da interação"
                                            className="mb-4 h-40 w-full object-cover rounded"
                                        />
                                    )}
                                    <p className="text-sm text-gray-600">
                                        Data e hora: {new Date(post.createdAt).toLocaleString()}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Tipo: {post.tags?.join(", ") || "Sem tipo"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Ranking: {post.ranking || "Não definido"}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Observações: {post.content || "Sem observações"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-600">Este usuário ainda não fez nenhuma postagem.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfile;