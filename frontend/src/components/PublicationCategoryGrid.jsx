import React from 'react';
import { PublicationCategoryCard } from './PublicationCategoryCard';
import { Plus } from 'lucide-react';

export function PublicationCategoryGrid({ categories, canCreate, canEdit, canDelete, onSelectCategory, onEditCategory, onDeleteCategory, onCreateCategory }) {
  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="text-lg font-bold text-charcoal">Select Manuscript Category</h2>
          <p className="text-sm text-steel-gray mt-1">Choose the appropriate category for your research publication to proceed.</p>
        </div>
        
        {canCreate && (
          <button
            onClick={onCreateCategory}
            className="px-4 py-2 bg-charcoal text-white hover:bg-steel-gray rounded-lg text-xs font-bold transition-colors flex items-center space-x-1.5 shadow-sm shrink-0"
          >
            <Plus className="h-4 w-4 shrink-0" />
            <span className="whitespace-nowrap">Create Category</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
        {categories.map((cat) => (
          <PublicationCategoryCard
            key={cat.id}
            category={cat}
            canEdit={canEdit}
            canDelete={canDelete}
            onSelect={onSelectCategory}
            onEdit={onEditCategory}
            onDelete={onDeleteCategory}
          />
        ))}
      </div>
      
      {categories.length === 0 && (
        <div className="text-center py-12 bg-ice-gray border border-dashed border-platinum-silver rounded-2xl">
          <p className="text-sm font-bold text-slate-gray">No publication categories available.</p>
        </div>
      )}
    </div>
  );
}
