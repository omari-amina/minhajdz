
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { RESOURCE_CATEGORY_LABELS, HIGH_SCHOOL_LEVELS } from '../constants';
import { 
    FileText, Image, Video, Download, Eye, Plus, Search, 
    CheckCircle, X, File, Filter, Star, Folder, FolderPlus, 
    Copy, History, Music, FileArchive, ArrowRight, Youtube,
    Link as LinkIcon, Trash2, Edit, MoreVertical, UploadCloud,
    FolderInput, Loader2
} from 'lucide-react';
import { ResourceType, Resource, ResourceCategory, EducationStage, ResourceFolder, CurriculumStandard } from '../types';
import * as db from '../db';
import { useUser } from '../context/UserContext';
import { useData } from '../context/DataContext';
import { getYoutubeId, determineResourceType } from '../utils/resourceUtils';

// --- MOCK CONSTANTS FOR DROPDOWNS ---
const CATEGORIES = Object.entries(RESOURCE_CATEGORY_LABELS);

export default function Library() {
  const { user, currentContext } = useUser();
  const { curriculumItems, resources, updateResources, folders, updateFolders } = useData();
  const [isLoading, setIsLoading] = useState(true);
  
  // Navigation State
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  
  // Modals State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<Resource | null>(null);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false); // New Move Modal
  
  // Selected Item for Actions
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  // Forms
  const [successMsg, setSuccessMsg] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Upload Form
  const [activeUploadTab, setActiveUploadTab] = useState<'FILE' | 'LINK'>('FILE');
  const [uploadMeta, setUploadMeta] = useState({
      title: '', // Only for single file or link
      description: '',
      linkUrl: '',
      category: ResourceCategory.OTHER,
      tags: ''
  });
  
  // Multi-File State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Filter State
  const [filters, setFilters] = useState({
      search: '',
      type: 'all',
      onlyFavorites: false
  });

  // Link Form
  const [linkMeta, setLinkMeta] = useState({
      subject: currentContext.subject,
      level: user.levels[0] || '',
      stream: '',
      unit: '',
      curriculumId: ''
  });

  // Move Form
  const [targetFolderId, setTargetFolderId] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
        setIsLoading(true);
        try { await db.initDB(); } catch (e) { console.error(e); }
        setIsLoading(false);
    };
    init();
  }, []);

  // --- DERIVED DATA ---
  const currentBreadcrumbs = useMemo(() => {
      const breadcrumbs = [];
      let currentId = currentFolderId;
      while (currentId) {
          const folder = folders.find(f => f.id === currentId);
          if (folder) {
              breadcrumbs.unshift(folder);
              currentId = folder.parentId;
          } else {
              break;
          }
      }
      return breadcrumbs;
  }, [currentFolderId, folders]);

  const currentItems = useMemo(() => {
      // 1. Folders in current directory
      const visibleFolders = folders.filter(f => f.parentId === currentFolderId);
      
      // 2. Resources in current directory (matching filters)
      const visibleResources = resources.filter(res => {
          const inFolder = res.folderId === currentFolderId;
          const matchSearch = res.title.toLowerCase().includes(filters.search.toLowerCase()) || 
                              res.tags.some(t => t.includes(filters.search));
          const matchType = filters.type === 'all' || res.type === filters.type;
          const matchFav = !filters.onlyFavorites || res.isFavorite;
          
          return inFolder && matchSearch && matchType && matchFav;
      }).sort((a,b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());

      return { folders: visibleFolders, resources: visibleResources };
  }, [folders, resources, currentFolderId, filters]);

  // --- ACTIONS ---

  const handleCreateFolder = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newFolderName.trim()) return;
      const newFolder: ResourceFolder = {
          id: `fld_${Date.now()}`,
          name: newFolderName,
          parentId: currentFolderId,
          createdAt: new Date().toISOString()
      };
      updateFolders([...folders, newFolder]);
      setCreateFolderOpen(false);
      setNewFolderName('');
  };

  const handleDeleteResource = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المورد؟')) {
          updateResources(resources.filter(r => r.id !== id));
      }
  };

  const handleDeleteFolder = (id: string) => {
      if (window.confirm('هل أنت متأكد من حذف هذا المجلد؟ (سيتم حذف المحتويات أيضاً)')) {
          // Recursive delete logic needed in real app, simplified here:
          updateFolders(folders.filter(f => f.id !== id));
          // Delete resources inside
          updateResources(resources.filter(r => r.folderId !== id));
      }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files.length > 0) {
          setSelectedFiles(prev => [...prev, ...Array.from(e.target.files || [])]);
      }
  };

  const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      if (activeUploadTab === 'FILE' && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
      }
  };

  const handleRemoveFile = (index: number) => {
      setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsUploading(true);
      
      const newResources: Resource[] = [];
      const tagsArray = uploadMeta.tags.split(',').map(t => t.trim()).filter(Boolean);

      if (activeUploadTab === 'FILE') {
          if (selectedFiles.length === 0) {
              setIsUploading(false);
              return;
          }

          for (const file of selectedFiles) {
              const type = determineResourceType(file);
              const size = (file.size / 1024 / 1024).toFixed(2) + ' MB';
              const newResource: Resource = {
                  id: `r_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
                  title: file.name, // Use filename as title for batch upload
                  description: uploadMeta.description,
                  type,
                  category: uploadMeta.category,
                  url: '#', // Placeholder, handled by DB
                  size,
                  dateAdded: new Date().toISOString().split('T')[0],
                  tags: tagsArray,
                  folderId: currentFolderId,
                  links: { subject: currentContext.subject },
                  isFavorite: false,
                  usageCount: 0,
                  version: 1
              };
              
              await db.addFile(newResource.id, file);
              newResources.push(newResource);
          }
      } else {
          // Link Upload
          if (!uploadMeta.linkUrl) {
              setIsUploading(false);
              return;
          }
          let type = ResourceType.LINK;
          if (getYoutubeId(uploadMeta.linkUrl)) type = ResourceType.YOUTUBE;

          const newResource: Resource = {
              id: `r_${Date.now()}`,
              title: uploadMeta.title || 'رابط جديد',
              description: uploadMeta.description,
              type,
              category: uploadMeta.category,
              url: uploadMeta.linkUrl,
              size: '0 B',
              dateAdded: new Date().toISOString().split('T')[0],
              tags: tagsArray,
              folderId: currentFolderId,
              links: { subject: currentContext.subject },
              isFavorite: false,
              usageCount: 0,
              version: 1
          };
          newResources.push(newResource);
      }

      updateResources([...newResources, ...resources]);
      setSuccessMsg(`تم إضافة ${newResources.length} مورد بنجاح`);
      setTimeout(() => setSuccessMsg(''), 3000);
      
      // Reset
      setIsUploading(false);
      setUploadModalOpen(false);
      setSelectedFiles([]);
      setUploadMeta({ title: '', description: '', linkUrl: '', category: ResourceCategory.OTHER, tags: '' });
  };

  const handleLinkSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedResource) return;

      const updated = resources.map(r => r.id === selectedResource.id ? {
          ...r,
          links: {
              ...r.links,
              subject: linkMeta.subject,
              level: linkMeta.level,
              stream: linkMeta.stream,
              unit: linkMeta.unit,
              curriculumId: linkMeta.curriculumId
          }
      } : r);

      updateResources(updated);
      setLinkModalOpen(false);
      setSelectedResource(null);
      setSuccessMsg('تم تحديث ارتباط المورد بنجاح');
      setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleMoveSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedResource) return;

      const updated = resources.map(r => r.id === selectedResource.id ? { ...r, folderId: targetFolderId } : r);
      updateResources(updated);
      
      setMoveModalOpen(false);
      setSelectedResource(null);
      setSuccessMsg('تم نقل المورد بنجاح');
      setTimeout(() => setSuccessMsg(''), 2000);
  };

  // --- HELPERS ---
  const getFileBlob = async (id: string): Promise<string> => {
      try {
          const files = await db.getAllFiles();
          const file = files.find(f => f.id === id);
          return file ? URL.createObjectURL(file.file) : '#';
      } catch { return '#'; }
  };

  const openPreview = async (res: Resource) => {
      const updated = resources.map(r => r.id === res.id ? { ...r, usageCount: (r.usageCount || 0) + 1 } : r);
      updateResources(updated);

      if (res.type === ResourceType.YOUTUBE || res.type === ResourceType.LINK) {
          setPreviewResource(res);
      } else {
          const url = await getFileBlob(res.id);
          setPreviewResource({ ...res, url });
      }
  };

  const getIcon = (type: ResourceType) => {
      switch(type) {
          case ResourceType.YOUTUBE: return <Youtube className="text-red-600" />;
          case ResourceType.VIDEO: return <Video className="text-red-500" />;
          case ResourceType.IMAGE: return <Image className="text-blue-500" />;
          case ResourceType.AUDIO: return <Music className="text-purple-500" />;
          case ResourceType.PDF: return <FileText className="text-red-600" />;
          case ResourceType.LINK: return <LinkIcon className="text-blue-400" />;
          case ResourceType.ARCHIVE: return <FileArchive className="text-amber-600" />;
          default: return <File className="text-slate-500" />;
      }
  };

  // Available Data for Link Modal
  const availableStreams = useMemo(() => {
      return Array.from(new Set(curriculumItems.filter(c => c.subject === linkMeta.subject && c.level === linkMeta.level && c.stream).map(c => c.stream)));
  }, [linkMeta.subject, linkMeta.level, curriculumItems]);

  const availableUnits = useMemo(() => {
      return Array.from(new Set(curriculumItems.filter(c => 
          c.subject === linkMeta.subject && 
          c.level === linkMeta.level && 
          (!linkMeta.stream || c.stream === linkMeta.stream)
      ).map(c => c.unit)));
  }, [linkMeta, curriculumItems]);

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {successMsg && ( <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-xl z-50 flex items-center gap-2 animate-bounce"><CheckCircle size={20} /><span>{successMsg}</span></div>)}

      {/* --- HEADER & TOOLBAR --- */}
      <div className="bg-white dark:bg-slate-800 p-4 border-b border-slate-200 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center shrink-0">
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
              <button onClick={() => setCurrentFolderId(null)} className={`flex items-center gap-1 text-sm font-bold ${!currentFolderId ? 'text-primary-600' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}>
                  <Folder size={16} /> المكتبة
              </button>
              {currentBreadcrumbs.map(folder => (
                  <React.Fragment key={folder.id}>
                      <span className="text-slate-300">/</span>
                      <button onClick={() => setCurrentFolderId(folder.id)} className="text-sm font-bold text-slate-500 hover:text-primary-600 dark:text-slate-400 whitespace-nowrap">
                          {folder.name}
                      </button>
                  </React.Fragment>
              ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                      type="text" 
                      value={filters.search} 
                      onChange={e => setFilters({...filters, search: e.target.value})}
                      placeholder="بحث في المجلد الحالي..."
                      className="w-full pr-9 pl-3 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                  />
              </div>
              <button onClick={() => setCreateFolderOpen(true)} className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600" title="مجلد جديد">
                  <FolderPlus size={20} />
              </button>
              <button onClick={() => setUploadModalOpen(true)} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-700 shadow-sm">
                  <UploadCloud size={18} /> <span className="hidden sm:inline">رفع</span>
              </button>
          </div>
      </div>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
          
          {/* Folders Grid */}
          {currentItems.folders.length > 0 && (
              <div className="mb-8">
                  <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">المجلدات</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {currentItems.folders.map(folder => (
                          <div 
                            key={folder.id} 
                            className="group bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 cursor-pointer transition-all hover:shadow-md relative"
                            onClick={() => setCurrentFolderId(folder.id)}
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <Folder className="text-yellow-400 fill-current" size={32} />
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id); }} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button>
                                  </div>
                              </div>
                              <p className="font-bold text-slate-700 dark:text-slate-200 text-sm truncate">{folder.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{folder.createdAt.split('T')[0]}</p>
                          </div>
                      ))}
                  </div>
              </div>
          )}

          {/* Resources List */}
          <div>
              <div className="flex justify-between items-center mb-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase">الملفات ({currentItems.resources.length})</h3>
                  <div className="flex gap-2">
                      <button onClick={() => setFilters({...filters, onlyFavorites: !filters.onlyFavorites})} className={`p-1.5 rounded-lg ${filters.onlyFavorites ? 'bg-amber-100 text-amber-600' : 'text-slate-400 hover:bg-slate-100'}`}><Star size={16} className={filters.onlyFavorites ? 'fill-current' : ''}/></button>
                  </div>
              </div>

              {currentItems.resources.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl">
                      <p>المجلد فارغ</p>
                  </div>
              ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {currentItems.resources.map(res => (
                          <div key={res.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all group relative overflow-hidden flex flex-col">
                              {/* Preview Area */}
                              <div className="h-32 bg-slate-100 dark:bg-slate-900 flex items-center justify-center relative cursor-pointer" onClick={() => openPreview(res)}>
                                  {res.type === ResourceType.IMAGE && res.url !== '#' ? (
                                      <img src={res.url} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                  ) : (
                                      <div className="scale-150 transform transition-transform group-hover:scale-125">{getIcon(res.type)}</div>
                                  )}
                                  
                                  {/* Overlay Buttons */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <button className="p-2 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-sm"><Eye size={18} /></button>
                                  </div>
                                  
                                  <button 
                                    onClick={(e) => { e.stopPropagation(); updateResources(resources.map(r => r.id === res.id ? {...r, isFavorite: !r.isFavorite} : r)) }}
                                    className="absolute top-2 left-2 text-slate-400 hover:text-amber-400 z-10"
                                  >
                                      <Star size={16} className={res.isFavorite ? 'text-amber-400 fill-current' : ''} />
                                  </button>
                              </div>

                              {/* Info Area */}
                              <div className="p-3 flex-1 flex flex-col">
                                  <div className="flex justify-between items-start mb-1">
                                      <h4 className="font-bold text-sm text-slate-800 dark:text-white line-clamp-1" title={res.title}>{res.title}</h4>
                                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={(e) => { e.stopPropagation(); setSelectedResource(res); setTargetFolderId(res.folderId || null); setMoveModalOpen(true); }} className="text-slate-300 hover:text-blue-500" title="نقل">
                                              <FolderInput size={14} />
                                          </button>
                                          <button onClick={(e) => { e.stopPropagation(); handleDeleteResource(res.id); }} className="text-slate-300 hover:text-red-500" title="حذف">
                                              <Trash2 size={14} />
                                          </button>
                                      </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mb-2">
                                      <span className="text-[10px] bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-500">{RESOURCE_CATEGORY_LABELS[res.category]}</span>
                                      {res.links?.unit && <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded truncate max-w-[100px]">{res.links.unit}</span>}
                                  </div>

                                  <div className="mt-auto pt-2 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                                      <span className="text-[10px] text-slate-400">{res.size}</span>
                                      <button 
                                        onClick={() => { setSelectedResource(res); setLinkMeta(prev => ({...prev, unit: res.links?.unit || ''})); setLinkModalOpen(true); }}
                                        className="text-[10px] flex items-center gap-1 text-primary-600 hover:underline font-medium"
                                      >
                                          <LinkIcon size={10} /> ربط
                                      </button>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* --- MODALS --- */}

      {/* Create Folder Modal */}
      {createFolderOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleCreateFolder} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                  <h3 className="font-bold text-lg mb-4 dark:text-white">مجلد جديد</h3>
                  <input 
                    autoFocus
                    type="text" 
                    value={newFolderName}
                    onChange={e => setNewFolderName(e.target.value)}
                    placeholder="اسم المجلد..."
                    className="w-full p-2 border rounded-lg mb-4 dark:bg-slate-700 dark:border-slate-600 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setCreateFolderOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">إلغاء</button>
                      <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold">إنشاء</button>
                  </div>
              </form>
          </div>
      )}

      {/* Move Resource Modal */}
      {moveModalOpen && selectedResource && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <form onSubmit={handleMoveSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-xl w-full max-w-sm animate-in zoom-in-95 duration-200">
                  <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2">
                      <FolderInput size={20} /> نقل "{selectedResource.title}"
                  </h3>
                  <div className="mb-4 space-y-2 max-h-60 overflow-y-auto">
                      <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                          <input type="radio" name="folder" checked={targetFolderId === null} onChange={() => setTargetFolderId(null)} />
                          <span className="text-sm font-bold">📂 المكتبة (الرئيسية)</span>
                      </label>
                      {folders.filter(f => f.id !== selectedResource.folderId).map(f => (
                          <label key={f.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-600">
                              <input type="radio" name="folder" checked={targetFolderId === f.id} onChange={() => setTargetFolderId(f.id)} />
                              <span className="text-sm text-slate-700 dark:text-slate-300">{f.name}</span>
                          </label>
                      ))}
                  </div>
                  <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setMoveModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">إلغاء</button>
                      <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold">نقل</button>
                  </div>
              </form>
          </div>
      )}

      {/* Upload Modal (Refactored for Multi-File) */}
      {uploadModalOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
                  <div className="flex border-b border-slate-200 dark:border-slate-700">
                      <button onClick={() => setActiveUploadTab('FILE')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeUploadTab === 'FILE' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-750'}`}>رفع ملفات</button>
                      <button onClick={() => setActiveUploadTab('LINK')} className={`flex-1 py-3 font-bold text-sm transition-colors ${activeUploadTab === 'LINK' ? 'bg-primary-50 dark:bg-primary-900/10 text-primary-600 border-b-2 border-primary-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-750'}`}>رابط خارجي</button>
                  </div>
                  
                  <form onSubmit={handleUploadSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
                      {activeUploadTab === 'FILE' ? (
                          <div 
                            className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors relative" 
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                          >
                              <input type="file" multiple ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
                              
                              <div className="text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2 pointer-events-none">
                                  <div className="p-4 bg-primary-50 dark:bg-slate-700 rounded-full text-primary-600 mb-2">
                                      <UploadCloud size={32} />
                                  </div>
                                  <p className="font-bold text-slate-700 dark:text-slate-300">اضغط للاختيار أو اسحب الملفات هنا</p>
                                  <p className="text-xs">يدعم الصور، الفيديو، المستندات، والصوتيات</p>
                              </div>
                              <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"></button>
                          </div>
                      ) : (
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">الرابط (URL)</label>
                              <input type="url" value={uploadMeta.linkUrl} onChange={e => setUploadMeta({...uploadMeta, linkUrl: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="https://youtube.com/..." required />
                          </div>
                      )}

                      {/* Selected Files List */}
                      {activeUploadTab === 'FILE' && selectedFiles.length > 0 && (
                          <div className="space-y-2 max-h-40 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg border dark:border-slate-700">
                              {selectedFiles.map((file, idx) => (
                                  <div key={idx} className="flex justify-between items-center text-xs bg-white dark:bg-slate-800 p-2 rounded border dark:border-slate-700">
                                      <div className="flex items-center gap-2 truncate">
                                          <FileText size={14} className="text-slate-400" />
                                          <span className="truncate max-w-[200px] text-slate-700 dark:text-slate-300">{file.name}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                          <button type="button" onClick={() => handleRemoveFile(idx)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      )}

                      {/* Metadata Form (Common) */}
                      <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-700">
                          {activeUploadTab === 'LINK' && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">العنوان</label>
                                  <input type="text" value={uploadMeta.title} onChange={e => setUploadMeta({...uploadMeta, title: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="عنوان المورد" />
                              </div>
                          )}
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">التصنيف</label>
                                  <select value={uploadMeta.category} onChange={e => setUploadMeta({...uploadMeta, category: e.target.value as ResourceCategory})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white outline-none">
                                      {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">الوسوم (مفصولة بفاصلة)</label>
                                  <input type="text" value={uploadMeta.tags} onChange={e => setUploadMeta({...uploadMeta, tags: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none" placeholder="درس، تمرين، 1AS..." />
                              </div>
                          </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                          <button type="button" onClick={() => { setUploadModalOpen(false); setSelectedFiles([]); }} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-medium">إلغاء</button>
                          <button 
                            type="submit" 
                            disabled={(activeUploadTab === 'FILE' && selectedFiles.length === 0) || isUploading} 
                            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                              {isUploading ? <Loader2 className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                              <span>{isUploading ? 'جاري الرفع...' : 'حفظ الموارد'}</span>
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Link Modal */}
      {linkModalOpen && selectedResource && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
              <form onSubmit={handleLinkSubmit} className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-md p-6 shadow-2xl animate-in zoom-in-95 duration-200">
                  <h3 className="font-bold text-lg mb-4 dark:text-white flex items-center gap-2"><LinkIcon size={20}/> ربط بالمنهاج</h3>
                  
                  <div className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">المادة</label>
                          <select value={linkMeta.subject} onChange={e => setLinkMeta({...linkMeta, subject: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white outline-none">
                              {user.subjects.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">المستوى</label>
                              <select value={linkMeta.level} onChange={e => setLinkMeta({...linkMeta, level: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white outline-none">
                                  {user.levels.map(l => <option key={l} value={l}>{l}</option>)}
                              </select>
                          </div>
                          {availableStreams.length > 0 && (
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 mb-1">الشعبة</label>
                                  <select value={linkMeta.stream} onChange={e => setLinkMeta({...linkMeta, stream: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white outline-none">
                                      <option value="">عام</option>
                                      {availableStreams.map(s => <option key={s} value={s}>{s}</option>)}
                                  </select>
                              </div>
                          )}
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">الوحدة</label>
                          <select value={linkMeta.unit} onChange={e => setLinkMeta({...linkMeta, unit: e.target.value})} className="w-full p-2 border rounded-lg dark:bg-slate-700 dark:text-white outline-none">
                              <option value="">-- غير محدد --</option>
                              {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                      </div>
                  </div>

                  <div className="pt-6 flex justify-end gap-3">
                      <button type="button" onClick={() => setLinkModalOpen(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg">إلغاء</button>
                      <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-700">حفظ الارتباط</button>
                  </div>
              </form>
          </div>
      )}

      {/* Preview Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setPreviewResource(null)}></div>
          <div className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl z-10 flex flex-col overflow-hidden relative animate-in zoom-in-95 duration-200">
             <div className="flex justify-between items-center p-4 border-b dark:border-slate-700 bg-white dark:bg-slate-900">
                 <h3 className="font-bold dark:text-white flex items-center gap-2 truncate max-w-lg">
                     {getIcon(previewResource.type)}
                     {previewResource.title}
                 </h3>
                 <button onClick={() => setPreviewResource(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X /></button>
             </div>
             <div className="flex-1 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-auto relative">
               
               {previewResource.type === ResourceType.IMAGE && (
                   <img src={previewResource.url} className="max-w-full max-h-full object-contain" />
               )}
               
               {previewResource.type === ResourceType.VIDEO && (
                   <video controls src={previewResource.url} className="max-w-full max-h-full" />
               )}

               {previewResource.type === ResourceType.YOUTUBE && (
                   <iframe 
                        width="100%" height="100%" 
                        src={`https://www.youtube.com/embed/${getYoutubeId(previewResource.url)}`} 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowFullScreen
                        className="w-full h-full"
                   ></iframe>
               )}
               
               {previewResource.type === ResourceType.PDF && (
                   <div className="w-full h-full relative group/pdf">
                        <object data={previewResource.url} type="application/pdf" className="w-full h-full">
                            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-4">
                                <p>تعذر عرض الملف داخل التطبيق.</p>
                                <a href={previewResource.url} download={previewResource.title} className="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-primary-700">
                                    تحميل الملف
                                </a>
                            </div>
                        </object>
                        {/* Always visible download button */}
                        <a 
                            href={previewResource.url} 
                            download={previewResource.title}
                            className="absolute bottom-6 left-6 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-black transition-transform hover:scale-110 z-20 flex items-center gap-2"
                            title="تحميل الملف"
                        >
                            <Download size={20} />
                            <span className="text-xs font-bold hidden group-hover/pdf:inline">تحميل</span>
                        </a>
                   </div>
               )}

               {/* Fallbacks */}
               {['DOC', 'ARCHIVE', 'AUDIO', 'LINK'].includes(previewResource.type) && (
                   <div className="text-center p-8">
                       <div className="mb-4 inline-block p-6 bg-slate-200 dark:bg-slate-800 rounded-full">{getIcon(previewResource.type)}</div>
                       <p className="dark:text-white text-lg font-bold mb-4">لا تتوفر معاينة لهذا النوع</p>
                       <a href={previewResource.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-bold">
                           <Download size={20} /> فتح / تحميل
                       </a>
                   </div>
               )}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
