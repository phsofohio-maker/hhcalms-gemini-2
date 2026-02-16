import React, { useState, useEffect } from 'react';
import { Course, Module, ContentBlock, BlockType } from '../types';
import { auditService } from '../services/auditService';
import { Button } from '../components/ui/Button';
import { BlockEditor } from '../components/builder/BlockEditor';
import { Plus, Save, Eye, ArrowLeft, Loader2, Check, AlertTriangle, Settings } from 'lucide-react';
import { generateId } from '../utils';

interface ModuleBuilderProps {
  course: Course;
  moduleId: string;
  userUid: string;
  onSave: (updatedCourse: Course) => void;
  onBack: () => void;
}

export const ModuleBuilder: React.FC<ModuleBuilderProps> = ({ course, moduleId, userUid, onSave, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [activeModule, setActiveModule] = useState<Module | null>(null);

  useEffect(() => {
    const module = course.modules.find(m => m.id === moduleId) || course.modules[0];
    if (module) {
      setActiveModule(JSON.parse(JSON.stringify(module)));
    }
  }, [course, moduleId]);

  const handleAddBlock = (type: BlockType, variant?: string) => {
    if (!activeModule) return;
    setIsSaved(false);

    const newBlock: ContentBlock = {
      id: generateId(),
      moduleId: activeModule.id,
      type,
      order: activeModule.blocks.length,
      required: true,
      data: { content: '' }
    };

    if (type === 'quiz') {
      newBlock.data = { title: 'New Assessment', questions: [], passingScore: 80 };
    }
    
    if (variant === 'callout') {
      newBlock.data = { content: 'Enter alert content...', variant: 'callout-warning' };
    }

    setActiveModule({
      ...activeModule,
      blocks: [...activeModule.blocks, newBlock]
    });
  };

  const handleUpdateBlock = (blockId: string, data: any) => {
    if (!activeModule) return;
    setIsSaved(false);
    const updatedBlocks = activeModule.blocks.map(b => b.id === blockId ? { ...b, data } : b);
    setActiveModule({ ...activeModule, blocks: updatedBlocks });
  };

  const handleDeleteBlock = (blockId: string) => {
    if (!activeModule) return;
    setIsSaved(false);
    const updatedBlocks = activeModule.blocks.filter(b => b.id !== blockId);
    setActiveModule({ ...activeModule, blocks: updatedBlocks });
  };

  const handleSave = async () => {
    if (!activeModule) return;
    setIsLoading(true);

    const updatedCourse = {
      ...course,
      modules: course.modules.map(m => m.id === activeModule.id ? activeModule : m)
    };

    await new Promise(resolve => setTimeout(resolve, 600));
    onSave(updatedCourse);
    
    auditService.logAction(
      userUid, 
      'Admin', 
      'MODULE_UPDATE', 
      activeModule.id, 
      `Saved ${activeModule.blocks.length} blocks for module: ${activeModule.title}`
    );

    setIsLoading(false);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  if (!activeModule) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-brand-600" /></div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-none">{course.title}</h1>
            <p className="text-xs text-slate-500 mt-1">Editing Module: {activeModule.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => {}} className="text-slate-500">
             <Settings className="h-4 w-4 mr-2" />
             Course Metadata
          </Button>
          <div className="w-px h-6 bg-slate-200 mx-1"></div>
          <Button onClick={handleSave} isLoading={isLoading} disabled={isSaved} className="min-w-[120px]">
            {isSaved ? <Check className="h-4 w-4 mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaved ? 'Saved' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-4xl mx-auto p-8 pb-32">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Module Title</label>
            <input 
              value={activeModule.title}
              onChange={(e) => {
                  setActiveModule({...activeModule, title: e.target.value});
                  setIsSaved(false);
              }}
              className="text-2xl font-bold text-slate-900 w-full border-none focus:ring-0 px-0 placeholder:text-slate-200 bg-white"
              placeholder="Enter module title..."
            />
          </div>

          <div className="space-y-6">
            {activeModule.blocks.map(block => (
                <BlockEditor 
                    key={block.id} 
                    block={block} 
                    onChange={handleUpdateBlock}
                    onDelete={handleDeleteBlock}
                />
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <div className="bg-white p-2 rounded-full shadow-xl border border-slate-200 flex gap-1 items-center">
                {[
                    { type: 'heading', label: 'Heading' },
                    { type: 'text', label: 'Text' },
                    { type: 'image', label: 'Image' },
                    { type: 'video', label: 'Video' },
                    { type: 'quiz', label: 'Quiz' },
                ].map((item) => (
                    <button
                        key={item.type}
                        onClick={() => handleAddBlock(item.type as BlockType)}
                        className="px-4 py-2 rounded-full hover:bg-slate-50 text-xs font-bold text-slate-600 flex items-center gap-2 transition-colors"
                    >
                        <Plus className="h-3 w-3 text-brand-500" />
                        {item.label}
                    </button>
                ))}
                <div className="w-px h-6 bg-slate-200 mx-2"></div>
                <button
                    onClick={() => handleAddBlock('text', 'callout')}
                    className="px-4 py-2 rounded-full bg-amber-50 hover:bg-amber-100 text-xs font-bold text-amber-700 flex items-center gap-2 transition-colors"
                >
                    <AlertTriangle className="h-3 w-3" />
                    Add Alert
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};