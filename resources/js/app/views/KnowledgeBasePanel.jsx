import React, { useState, useEffect } from 'react';
import { api } from '../api';
import Modal from '../ui/Modal';

const emptyCreate = {
    title: '',
    summary: '',
    content: '',
    category: 'general',
    tags: [],
    is_published: true,
};

export default function KnowledgeBasePanel({ setError }) {
    const [articles, setArticles] = useState();
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [createForm, setCreateForm] = useState({ ...emptyCreate });

    useEffect(() => {
        fetchCategories();
        fetchArticles();
    }, []);

    useEffect(() => {
        fetchArticles();
    }, [selectedCategory, searchQuery]);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/knowledge-base/categories');
            setCategories(response.data.data);
        } catch (e) {
            setError(e?.('response?.data?.message') || 'Gagal memuat kategori');
        }
    };

    const fetchArticles = async () => {
        setIsLoading(true);
        try {
            const params = {};
            if (selectedCategory !== 'all') {
                params.category = selectedCategory;
            }
            if (searchQuery) {
                params.search = searchQuery;
            }

            const response = await api.get('/knowledge-base', { params });
            setArticles(response.data.data);
        } catch (e) {
            setError(e?.('response?.data?.message') || 'Gagal memuat artikel');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (query) => {
        setSearchQuery(query);
    };

    const openCreate = () => {
        setCreateForm({ ...emptyCreate });
        setIsCreateOpen(true);
    };

    const createArticle = async (event) => {
        event.preventDefault();
        try {
            await api.post('/knowledge-base', {
                title: createForm.title,
                summary: createForm.summary,
                content: createForm.content,
                category: createForm.category,
                tags: createForm.tags,
                is_published: createForm.is_published,
            });
            setIsCreateOpen(false);
            setCreateForm({ ...emptyCreate });
            await fetchArticles();
            setError?.('Artikel berhasil dibuat');
        } catch (e) {
            setError?.(e?.('response?.data?.message') || 'Gagal membuat artikel');
        }
    };

    const toggleTag = (tag) => {
        setCreateForm((prev) => {
            const exists = prev.tags.includes(tag);
            const nextTags = exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag];
            return { ...prev, tags: nextTags };
        });
    };

    const availableTags = ['urgent', 'sering', 'dokumentasi', 'panduan', 'best-practices', 'keamanan', 'performa'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-medium text-slate-900 dark:text-slate-100">Basis Pengetahuan</h2>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cari dan telusuri dokumentasi teknis untuk troubleshooting dan praktik terbaik. Konten akan digunakan untuk training AI Helpdesk.</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-lg shadow-blue-600/20"
                >
                    Tambah Pengetahuan
                </button>
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Cari di basis pengetahuan..."
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            onClick={() => handleSearch(searchQuery)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setSelectedCategory('all')}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-300"
                >
                    Semua Kategori
                </button>
                {Object.entries(categories).map(([key, label]) => (
                    <button
                        key={key}
                        onClick={() => setSelectedCategory(key)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize"
                    >
                        {label}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            ) : articles.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-sm text-slate-500 dark:text-slate-400">Tidak ada artikel ditemukan</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {articles.map((article) => (
                        <article
                            key={article.id}
                            onClick={() => setSelectedArticle(article)}
                            className="cursor-pointer rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-700 transition-all"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize">
                                    {article.category}
                                </span>
                                {article.rating && (
                                    <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                        {article.rating}
                                    </span>
                                )}
                            </div>
                            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2">
                                {article.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                                {article.summary}
                                                       </p>
                            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                                <span>{article.view_count} dilihat</span>
                                <span>{new Date(article.created_at).toLocaleDateString('id-ID')}</span>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {selectedArticle && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
                    onClick={() => setSelectedArticle(null)}
                >
                    <div
                        className="w-full max-w-3xl max-h-[80vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 capitalize mb-2">
                                        {selectedArticle.category}
                                    </span>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                        {selectedArticle.title}
                                    </h2>
                                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                                        {selectedArticle.summary}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedArticle(null)}
                                    className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-6">
                            <div className="prose prose-slate dark:prose-invert max-w-none">
                                {selectedArticle.content.split('\n').map((line, idx) => {
                                    if (line.startsWith('## ')) {
                                        return <h3 key={idx} className="text-lg font-semibold mt-6 mb-3">{line.replace('## ', '')}</h3>;
                                    } else if (line.startsWith('### ')) {
                                        return <h4 key={idx} className="text-base font-semibold mt-4 mb-2">{line.replace('### ', '')}</h4>;
                                    } else if (line.startsWith('- ')) {
                                        return <li key={idx} className="ml-4 text-sm">{line.replace('- ', '')}</li>;
                                    } else if (line.trim() === '') {
                                        return;
                                    } else {
                                        return <p key={idx} className="text-sm leading-relaxed">{line}</p>;
                                    }
                                })}
                            </div>
                        </div>
                        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
                            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                                <div>
                                    <span className="font-medium">Dibuat oleh:</span> {selectedArticle.creator?.name || 'Tidak diketahui'}
                                </div>
                                <div className="flex items-center gap-4">
                                    <span>{selectedArticle.view_count} dilihat</span>
                                    <span>{selectedArticle.usage_count} kali digunakan</span>
                                    {selectedArticle.rating && <span>Rating: {selectedArticle.rating}</span>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Modal
                title="Tambah Pengetahuan"
                isOpen={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                footer={
                    <>
                        <button
                            className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700 hover:bg-slate-200 transition-colors dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                            type="button"
                            onClick={() => setIsCreateOpen(false)}
                        >
                            Batal
                        </button>
                        <button
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg py-2.5 px-4 transition-colors shadow-lg shadow-blue-600/20"
                            type="submit"
                            form="knowledge-create-form"
                        >
                            Buat
                        </button>
                    </>
                }
            >
                <form id="knowledge-create-form" className="space-y-4" onSubmit={createArticle}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Judul *
                        </label>
                        <input
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            type="text"
                            required
                            value={createForm.title}
                            onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
                            placeholder="Judul artikel"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Ringkasan *
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[80px]"
                            required
                            value={createForm.summary}
                            onChange={(e) => setCreateForm((p) => ({ ...p, summary: e.target.value }))}
                            placeholder="Ringkasan singkat artikel"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Kategori *
                        </label>
                        <select
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            required
                            value={createForm.category}
                            onChange={(e) => setCreateForm((p) => ({ ...p, category: e.target.value }))}
                        >
                            <option value="network">Jaringan</option>
                            <option value="server">Server</option>
                            <option value="application">Aplikasi</option>
                            <option value="security">Keamanan</option>
                            <option value="monitoring">Monitoring</option>
                            <option value="troubleshooting">Troubleshooting</option>
                            <option value="general">Umum</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                            Konten *
                        </label>
                        <textarea
                            className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-blue-500 dark:focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[200px]"
                            required
                            value={createForm.content}
                            onChange={(e) => setCreateForm((p) => ({ ...p, content: e.target.value }))}
                            placeholder="## Masalah [Deskripsikan masalah] ## Solusi ### Langkah 1 [Penjelasan] ### Langkah 2 [Penjelasan] ## Tips Tambahan [Informasi tambahan]"
                        />
	                    <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
	                            <span className="text-slate-600 dark:text-slate-300">tips untuk AI RAG:</span>{' '}
	                            Tulis dengan bahasa Indonesia yang jelas dan mudah dipahami.
	                        </p>
	                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Tag
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {availableTags.map((tag) => (
                                <button
                                    key={tag}
                                    type="button"
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize"
                                    onClick={() => toggleTag(tag)}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

	                    <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 dark:text-slate-300">
	                        <input
	                            type="checkbox"
	                            checked={createForm.is_published}
	                            onChange={(e) =>
	                                setCreateForm((p) => ({ ...p, is_published: e.target.checked }))
	                            }
	                        />
	                        <span className="text-sm text-slate-700 dark:text-slate-300">Publikasikan segera</span>
	                    </label>
	                </form>
	            </Modal>
        </div>
    );
}
