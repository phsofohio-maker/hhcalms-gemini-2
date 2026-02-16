import React from 'react';
import { BlockType, ContentBlock, QuizBlockData, TextBlockData, ImageBlockData, VideoBlockData, QuizQuestion, QuizQuestionType } from '../../types';
import { 
  Trash2, GripVertical, CheckSquare, Image as ImageIcon, 
  Type, Video, Hash, Bold, Italic, List, Link as LinkIcon,
  AlertTriangle, Info, AlertOctagon, FileText, ChevronDown, Plus,
  Minus, Layers, AlignLeft
} from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '../../utils';

interface BlockEditorProps {
  block: ContentBlock;
  onChange: (id: string, data: any) => void;
  onDelete: (id: string) => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({ block, onChange, onDelete }) => {
  
  const handleChange = (field: string, value: any) => {
    onChange(block.id, { ...block.data, [field]: value });
  };

  const renderRichTextToolbar = () => (
    <div className="flex items-center gap-1 p-2 border-b border-slate-200 bg-slate-50 rounded-t-md">
      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Bold"><Bold className="h-4 w-4" /></button>
      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Italic"><Italic className="h-4 w-4" /></button>
      <div className="w-px h-4 bg-slate-300 mx-1"></div>
      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="List"><List className="h-4 w-4" /></button>
      <button className="p-1.5 hover:bg-slate-200 rounded text-slate-600" title="Link"><LinkIcon className="h-4 w-4" /></button>
    </div>
  );

  const renderQuizQuestionEditor = (q: QuizQuestion, qIdx: number, quizData: QuizBlockData) => {
    const updateQuestion = (updates: Partial<QuizQuestion>) => {
      const newQuestions = [...quizData.questions];
      newQuestions[qIdx] = { ...q, ...updates };
      handleChange('questions', newQuestions);
    };

    const removeQuestion = () => {
      const newQuestions = quizData.questions.filter((_, idx) => idx !== qIdx);
      handleChange('questions', newQuestions);
    };

    return (
      <div key={q.id || qIdx} className="border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden mb-4">
        <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <span className="text-xs font-bold text-slate-400">Q{qIdx + 1}</span>
             <select 
               className="text-xs font-bold text-brand-600 bg-transparent outline-none border-none p-0 cursor-pointer uppercase"
               value={q.type}
               onChange={(e) => {
                 const newType = e.target.value as QuizQuestionType;
                 const updates: Partial<QuizQuestion> = { type: newType };
                 if (newType === 'true-false') {
                   updates.options = ['True', 'False'];
                   updates.correctAnswer = 0;
                 } else if (newType === 'matching') {
                   updates.matchingPairs = [{ left: '', right: '' }];
                 } else if (newType === 'fill-blank') {
                   updates.correctAnswer = '';
                 } else if (newType === 'short-answer') {
                   updates.correctAnswer = 'Describe the key components required for this clinical scenario...';
                 } else {
                   updates.options = ['Option A', 'Option B'];
                   updates.correctAnswer = 0;
                 }
                 updateQuestion(updates);
               }}
             >
               <option value="multiple-choice">Multiple Choice</option>
               <option value="true-false">True / False</option>
               <option value="matching">Matching</option>
               <option value="fill-blank">Fill in the Blank</option>
               <option value="short-answer">Short Answer / Essay</option>
             </select>
          </div>
          <button onClick={removeQuestion} className="text-slate-400 hover:text-red-500 p-1">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <textarea 
            className="w-full text-sm font-medium border-none focus:ring-0 p-0 resize-none bg-transparent placeholder:text-slate-300 text-slate-900"
            rows={2}
            value={q.question}
            placeholder="Enter the question text..."
            onChange={(e) => updateQuestion({ question: e.target.value })}
          />

          {/* Multiple Choice Editor */}
          {q.type === 'multiple-choice' && (
            <div className="space-y-2 pl-4 border-l-2 border-slate-100">
              {q.options.map((opt, oIdx) => (
                <div key={oIdx} className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    checked={q.correctAnswer === oIdx}
                    onChange={() => updateQuestion({ correctAnswer: oIdx })}
                    className="text-brand-600"
                  />
                  <input 
                    className="flex-1 text-xs p-1 border-b border-transparent focus:border-brand-300 outline-none text-slate-600"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...q.options];
                      newOpts[oIdx] = e.target.value;
                      updateQuestion({ options: newOpts });
                    }}
                  />
                  <button 
                    onClick={() => {
                      const newOpts = q.options.filter((_, idx) => idx !== oIdx);
                      updateQuestion({ options: newOpts });
                    }}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateQuestion({ options: [...q.options, `New Option`] })}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Option
              </button>
            </div>
          )}

          {/* True/False Editor */}
          {q.type === 'true-false' && (
            <div className="flex gap-4 pl-4">
              {['True', 'False'].map((label, idx) => (
                <label key={label} className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer">
                  <input 
                    type="radio" 
                    checked={q.correctAnswer === idx}
                    onChange={() => updateQuestion({ correctAnswer: idx })}
                    className="text-brand-600"
                  />
                  {label}
                </label>
              ))}
            </div>
          )}

          {/* Matching Editor */}
          {q.type === 'matching' && (
            <div className="space-y-3 pl-4 border-l-2 border-slate-100">
              {q.matchingPairs?.map((pair, pIdx) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <input 
                    placeholder="Term"
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-brand-300"
                    value={pair.left}
                    onChange={(e) => {
                      const newPairs = [...(q.matchingPairs || [])];
                      newPairs[pIdx].left = e.target.value;
                      updateQuestion({ matchingPairs: newPairs });
                    }}
                  />
                  <div className="text-slate-300">→</div>
                  <input 
                    placeholder="Match"
                    className="flex-1 text-xs p-2 bg-slate-50 border border-slate-200 rounded outline-none focus:border-brand-300"
                    value={pair.right}
                    onChange={(e) => {
                      const newPairs = [...(q.matchingPairs || [])];
                      newPairs[pIdx].right = e.target.value;
                      updateQuestion({ matchingPairs: newPairs });
                    }}
                  />
                  <button 
                    onClick={() => {
                      const newPairs = q.matchingPairs?.filter((_, idx) => idx !== pIdx);
                      updateQuestion({ matchingPairs: newPairs });
                    }}
                    className="text-slate-300 hover:text-red-400"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => updateQuestion({ matchingPairs: [...(q.matchingPairs || []), { left: '', right: '' }] })}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="h-3 w-3" /> Add Pair
              </button>
            </div>
          )}

          {/* Fill Blank Editor */}
          {q.type === 'fill-blank' && (
            <div className="pl-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Correct Answer</label>
               <input 
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-brand-300 outline-none"
                  value={q.correctAnswer}
                  placeholder="The exact word/phrase..."
                  onChange={(e) => updateQuestion({ correctAnswer: e.target.value })}
               />
            </div>
          )}

          {/* Short Answer / Essay Editor */}
          {q.type === 'short-answer' && (
            <div className="pl-4 space-y-3">
               <div>
                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Response Guidelines / Rubric</label>
                 <textarea 
                    className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded focus:border-brand-300 outline-none min-h-[80px]"
                    value={q.correctAnswer}
                    placeholder="Instruct the student on what should be included in their response..."
                    onChange={(e) => updateQuestion({ correctAnswer: e.target.value })}
                 />
                 <p className="text-[10px] text-slate-400 italic mt-1 flex items-center gap-1">
                   <Info className="h-3 w-3" />
                   Manual grading is typically required for clinical reflections.
                 </p>
               </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (block.type) {
      case 'heading':
        return (
          <div className="space-y-2">
            <input 
              type="text" 
              className="w-full px-0 py-2 text-2xl font-bold border-b-2 border-slate-100 focus:border-brand-500 outline-none bg-transparent placeholder:text-slate-300 text-slate-900"
              value={(block.data as TextBlockData).content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="Heading Title"
            />
          </div>
        );
      
      case 'text':
        const textData = block.data as TextBlockData;
        const currentVariant = textData.variant || 'paragraph';
        
        return (
          <div className="space-y-3">
             <div className="flex gap-2">
                {[
                  { id: 'paragraph', icon: FileText, label: 'Text', color: 'bg-slate-100 text-slate-700' },
                  { id: 'callout-info', icon: Info, label: 'Info', color: 'bg-blue-100 text-blue-700' },
                  { id: 'callout-warning', icon: AlertTriangle, label: 'Warning', color: 'bg-amber-100 text-amber-700' },
                  { id: 'callout-critical', icon: AlertOctagon, label: 'Critical', color: 'bg-red-100 text-red-700' },
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => handleChange('variant', opt.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                      currentVariant === opt.id ? opt.color : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <opt.icon className="h-3 w-3" />
                    {opt.label}
                  </button>
                ))}
             </div>

             <div className={cn(
                "rounded-md border transition-colors bg-white",
                currentVariant === 'callout-info' && "border-l-4 border-l-blue-500 border-slate-200",
                currentVariant === 'callout-warning' && "border-l-4 border-l-amber-500 border-slate-200",
                currentVariant === 'callout-critical' && "border-l-4 border-l-red-500 border-slate-200",
                currentVariant === 'paragraph' && "border-slate-300 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500"
             )}>
                {renderRichTextToolbar()}
                <textarea 
                  className="w-full p-4 min-h-[120px] outline-none resize-y rounded-b-md text-slate-700 text-sm leading-relaxed bg-white"
                  value={textData.content || ''}
                  onChange={(e) => handleChange('content', e.target.value)}
                  placeholder="Start typing your content here..."
                />
             </div>
          </div>
        );

      case 'image':
        const imgData = block.data as ImageBlockData;
        return (
          <div className="space-y-4">
             <div className="p-6 border-2 border-dashed border-slate-300 rounded-lg bg-slate-50 text-center hover:bg-slate-100 transition-colors cursor-pointer group">
                {imgData.url ? (
                  <div className="relative">
                     <img src={imgData.url} alt="Preview" className="max-h-64 mx-auto rounded shadow-sm" />
                     <button onClick={() => handleChange('url', '')} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                     </button>
                  </div>
                ) : (
                  <div className="py-4">
                    <ImageIcon className="h-12 w-12 text-slate-300 group-hover:text-brand-500 transition-colors mb-2 mx-auto" />
                    <p className="text-sm font-medium text-slate-700">Click to upload or paste URL</p>
                    <input 
                       type="text" 
                       placeholder="Paste image URL..." 
                       className="mt-4 w-full max-sm text-sm p-2 border rounded text-center bg-white"
                       onChange={(e) => handleChange('url', e.target.value)}
                    />
                  </div>
                )}
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <input className="w-full text-sm p-2 border border-slate-300 rounded outline-none" placeholder="Caption" value={imgData.caption || ''} onChange={(e) => handleChange('caption', e.target.value)} />
                <input className="w-full text-sm p-2 border border-slate-300 rounded outline-none" placeholder="Alt Text (Required)" value={imgData.altText || ''} onChange={(e) => handleChange('altText', e.target.value)} />
             </div>
          </div>
        );

      case 'video':
        const vidData = block.data as VideoBlockData;
        return (
          <div className="space-y-4">
             <div className="grid grid-cols-12 gap-4">
                <input className="col-span-8 p-2 border border-slate-300 rounded text-sm" placeholder="Title" value={vidData.title || ''} onChange={(e) => handleChange('title', e.target.value)} />
                <input className="col-span-4 p-2 border border-slate-300 rounded text-sm" placeholder="Duration (Min)" type="number" onChange={(e) => handleChange('duration', parseInt(e.target.value) * 60)} />
             </div>
            <input className="w-full p-2 border border-slate-300 rounded text-sm font-mono text-brand-600" placeholder="Embed URL" value={vidData.url || ''} onChange={(e) => handleChange('url', e.target.value)} />
            <textarea className="w-full p-2 border border-slate-300 rounded text-sm h-20" placeholder="Transcript..." value={vidData.transcript || ''} onChange={(e) => handleChange('transcript', e.target.value)} />
          </div>
        );

      case 'quiz':
        const quizData = block.data as QuizBlockData;
        return (
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-brand-50 to-white p-4 rounded border border-brand-100 flex justify-between items-center">
               <div>
                  <h4 className="text-sm font-bold text-brand-900">Assessment Settings</h4>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs font-semibold text-slate-600 uppercase">Pass Score:</span>
                 <input 
                   type="number"
                   className="w-16 p-1 text-sm border border-brand-200 rounded text-center font-bold"
                   value={quizData.passingScore || 80}
                   onChange={(e) => handleChange('passingScore', parseInt(e.target.value))}
                 />
                 <span className="text-sm font-bold text-slate-400">%</span>
               </div>
            </div>
            
            <div className="space-y-4">
              {(quizData.questions || []).map((q, qIdx) => renderQuizQuestionEditor(q, qIdx, quizData))}
            </div>
            
            <Button 
                size="sm" 
                variant="outline" 
                className="w-full border-dashed border-slate-300 text-slate-500 hover:border-brand-400 hover:text-brand-600"
                onClick={() => {
                    const newQ: QuizQuestion = { 
                      id: Math.random().toString(), 
                      type: 'multiple-choice',
                      question: '', 
                      options: ['Option A', 'Option B'], 
                      correctAnswer: 0, 
                      points: 10 
                    };
                    handleChange('questions', [...(quizData.questions || []), newQ]);
                }}
            >
                <Plus className="h-4 w-4 mr-2" /> Add Question
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="group border border-slate-200 rounded-lg bg-white shadow-sm transition-all hover:border-brand-300">
      <div className="flex items-center justify-between p-2 pl-4 bg-white border-b border-slate-100 rounded-t-lg">
        <div className="flex items-center gap-3">
            <GripVertical className="h-4 w-4 text-slate-300" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{block.type}</span>
        </div>
        <button onClick={() => onDelete(block.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded">
            <Trash2 className="h-4 w-4" />
        </button>
      </div>
      <div className="p-5">{renderContent()}</div>
    </div>
  );
};