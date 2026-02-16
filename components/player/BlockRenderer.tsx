import React, { useState } from 'react';
import { ContentBlock, TextBlockData, VideoBlockData, ImageBlockData, QuizBlockData, QuizQuestion } from '../../types';
import { cn } from '../../utils';
import { Info, AlertTriangle, AlertOctagon, ChevronDown, ChevronUp, CheckCircle, HelpCircle, AlignLeft } from 'lucide-react';

interface BlockRendererProps {
  block: ContentBlock;
  onQuizAnswer?: (blockId: string, questionIndex: number, answer: any) => void;
  answers?: Record<string, any[]>; // blockId -> array of selected answers
}

export const BlockRenderer: React.FC<BlockRendererProps> = ({ block, onQuizAnswer, answers }) => {
  const [showTranscript, setShowTranscript] = useState(false);

  const renderQuizQuestion = (q: QuizQuestion, qIdx: number, blockId: string) => {
    const currentAnswer = answers?.[blockId]?.[qIdx];

    switch (q.type) {
      case 'multiple-choice':
      case 'true-false':
        return (
          <div className="space-y-3">
            <p className="font-semibold text-slate-900 text-sm">{qIdx + 1}. {q.question}</p>
            <div className="space-y-2 pl-4">
              {q.options.map((opt, oIdx) => {
                const isSelected = currentAnswer === oIdx;
                return (
                  <label key={oIdx} className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    isSelected ? "bg-brand-50 border-brand-500 ring-1 ring-brand-500" : "bg-white border-slate-200 hover:bg-slate-50"
                  )}>
                    <input 
                      type="radio" 
                      className="text-brand-600 h-4 w-4"
                      checked={isSelected}
                      onChange={() => onQuizAnswer?.(blockId, qIdx, oIdx)}
                    />
                    <span className={cn("text-sm", isSelected ? "text-brand-900 font-medium" : "text-slate-600")}>{opt}</span>
                  </label>
                );
              })}
            </div>
          </div>
        );

      case 'fill-blank':
        return (
          <div className="space-y-3">
            <p className="font-semibold text-slate-900 text-sm">{qIdx + 1}. {q.question}</p>
            <div className="pl-4">
              <input 
                type="text"
                className="w-full max-w-md p-3 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                placeholder="Type your answer..."
                value={currentAnswer || ''}
                onChange={(e) => onQuizAnswer?.(blockId, qIdx, e.target.value)}
              />
            </div>
          </div>
        );

      case 'matching':
        const allRightValues = q.matchingPairs?.map(p => p.right).sort() || [];
        return (
          <div className="space-y-3">
            <p className="font-semibold text-slate-900 text-sm">{qIdx + 1}. {q.question}</p>
            <div className="space-y-3 pl-4">
              {q.matchingPairs?.map((pair, pIdx) => {
                const val = (currentAnswer || [])[pIdx];
                return (
                  <div key={pIdx} className="flex items-center gap-4">
                    <div className="flex-1 text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-200 font-medium">
                      {pair.left}
                    </div>
                    <div className="text-slate-300">→</div>
                    <select 
                      className="flex-1 p-3 rounded border border-slate-200 text-sm bg-white outline-none focus:ring-2 focus:ring-brand-500"
                      value={val || ''}
                      onChange={(e) => {
                        const newAns = [...(currentAnswer || [])];
                        newAns[pIdx] = e.target.value;
                        onQuizAnswer?.(blockId, qIdx, newAns);
                      }}
                    >
                      <option value="">Select match...</option>
                      {allRightValues.map(rv => <option key={rv} value={rv}>{rv}</option>)}
                    </select>
                  </div>
                );
              })}
            </div>
          </div>
        );
      
      case 'short-answer':
        const charCount = (currentAnswer || '').length;
        return (
          <div className="space-y-3">
            <p className="font-semibold text-slate-900 text-sm">{qIdx + 1}. {q.question}</p>
            <div className="pl-4 space-y-2">
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <AlignLeft className="h-3 w-3" />
                Reflective response required (min. 20 chars)
              </div>
              <textarea 
                className="w-full p-4 rounded-lg border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 min-h-[120px] resize-y"
                placeholder="Compose your essay or short answer here..."
                value={currentAnswer || ''}
                onChange={(e) => onQuizAnswer?.(blockId, qIdx, e.target.value)}
              />
              <div className="flex justify-end">
                <span className={cn("text-[10px] font-bold", charCount >= 20 ? "text-green-600" : "text-slate-400")}>
                  {charCount} characters
                </span>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  switch (block.type) {
    case 'heading':
      return <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">{(block.data as any).content}</h2>;

    case 'text':
      const textData = block.data as TextBlockData;
      const variant = textData.variant || 'paragraph';
      if (variant === 'paragraph') return <div className="prose prose-slate max-w-none text-slate-700 mb-6 whitespace-pre-wrap">{textData.content}</div>;
      
      const styles = {
        'callout-info': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-900', icon: Info, iconColor: 'text-blue-600' },
        'callout-warning': { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: AlertTriangle, iconColor: 'text-amber-600' },
        'callout-critical': { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: AlertOctagon, iconColor: 'text-red-600' },
      }[variant];

      if (!styles) return null;
      const Icon = styles.icon;
      return (
        <div className={cn("p-4 rounded-lg border flex gap-4 mb-6", styles.bg, styles.border)}>
          <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", styles.iconColor)} />
          <div className={cn("text-sm leading-relaxed font-medium", styles.text)}>{textData.content}</div>
        </div>
      );

    case 'image':
      const imgData = block.data as ImageBlockData;
      return (
        <div className="mb-8">
          <figure className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
            <img src={imgData.url} alt={imgData.altText || 'Course image'} className="w-full h-auto max-h-[500px] object-contain mx-auto" />
          </figure>
          {imgData.caption && <figcaption className="text-center text-xs text-slate-500 mt-2 font-medium">{imgData.caption}</figcaption>}
        </div>
      );

    case 'video':
      const vidData = block.data as VideoBlockData;
      return (
        <div className="mb-8">
          <div className="aspect-video w-full rounded-xl overflow-hidden shadow-sm border border-slate-200 bg-black">
            <iframe src={vidData.url} className="w-full h-full" allowFullScreen title={vidData.title} />
          </div>
          <div className="flex items-center justify-between mt-3 px-1">
             <span className="text-sm font-bold text-slate-700">{vidData.title}</span>
             {vidData.transcript && (
               <button onClick={() => setShowTranscript(!showTranscript)} className="text-xs font-medium text-brand-600 flex items-center gap-1">
                 {showTranscript ? <ChevronUp className="h-3 w-3"/> : <ChevronDown className="h-3 w-3"/>}
                 Transcript
               </button>
             )}
          </div>
          {showTranscript && vidData.transcript && <div className="mt-2 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 h-32 overflow-y-auto">{vidData.transcript}</div>}
        </div>
      );

    case 'quiz':
      const quizData = block.data as QuizBlockData;
      return (
        <div className="my-8 border border-brand-200 rounded-xl overflow-hidden bg-white shadow-sm">
          <div className="bg-brand-50 px-6 py-4 border-b border-brand-100 flex justify-between items-center">
             <h3 className="font-bold text-brand-900 flex items-center gap-2"><HelpCircle className="h-5 w-5 text-brand-600" />{quizData.title || 'Knowledge Check'}</h3>
             <span className="text-[10px] font-bold text-brand-600 bg-white px-2 py-1 rounded border border-brand-200">PASS: {quizData.passingScore}%</span>
          </div>
          <div className="p-6 space-y-10">
            {(quizData.questions || []).map((q, qIdx) => (
              <div key={qIdx}>{renderQuizQuestion(q, qIdx, block.id)}</div>
            ))}
          </div>
        </div>
      );

    default:
      return null;
  }
};