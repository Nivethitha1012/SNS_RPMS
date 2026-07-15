/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { usePublicationCategory } from '../../hooks/usePublicationCategory';
import { useUploadManuscript } from '../../hooks/useUploadManuscript';
import { usePayment } from '../../hooks/usePayment';
import { useInvoice } from '../../hooks/useInvoice';
import { usePaymentSettings } from '../../hooks/usePaymentSettings';
import { useDisabledCategories } from '../../hooks/useDisabledCategories';
import { getSubmissionQueue, getDrafts, markDraftAsSubmitted } from '../../services/publicationService';
import { PublicationCategoryGrid } from '../../components/PublicationCategoryGrid';
import { PublicationCategoryModal } from '../../components/PublicationCategoryModal';
import { CategoryDeleteModal } from '../../components/CategoryDeleteModal';
import { PublicationUploadForm } from '../../components/PublicationUploadForm';
import { PaymentSummary } from '../../components/PaymentSummary';
import { usePermissions } from '../../hooks/usePermissions';
import { CheckCircle } from 'lucide-react';
import { Modal } from '../../components/Modal';

export const UploadPage = ({ currentUser, onSuccess, onCancelSubmission }) => {
  const { hasFeatureAccess } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();

  const {
    categories,
    loading: categoriesLoading,
    addCategory,
    updateCategory,
    deleteCategory
  } = usePublicationCategory();

  const {
    step,
    selectedCategory,
    publicationDetails,
    nextStep,
    prevStep,
    goToStep,
    selectCategory,
    updatePublicationDetails,
    resetFlow
  } = useUploadManuscript();

  const {
    loading: paymentLoading,
    error: paymentError,
    processPayment,
    verifyPayment,
    loadRazorpaySDK
  } = usePayment();

  const { generateInvoice } = useInvoice();

  // Admin payment toggle settings
  const { isPaymentEnabled, togglePayment } = usePaymentSettings();

  // Disabled categories logic
  const { disabledCategoryIds, disableCategory, enableCategory } = useDisabledCategories(categories, updateCategory);

  // Modal state for Admin
  const [modalState, setModalState] = useState({ isOpen: false, editingCategory: null });
  const [deleteModalState, setDeleteModalState] = useState({ isOpen: false, category: null, mode: 'confirm' });

  const [drafts, setDrafts] = useState([]);
  const [pendingDraftCategory, setPendingDraftCategory] = useState(null);
  const [autoSaving, setAutoSaving] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const autoSavedDraftRef = useRef(null); // tracks auto-saved customPubId for current session
  const [categoriesWithSubmissions, setCategoriesWithSubmissions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      getDrafts()
        .then(data => setDrafts(data || []))
        .catch(err => console.error("Failed to load drafts:", err));
    }
  }, [currentUser, step]);

  useEffect(() => {
    if (currentUser && categories.length > 0) {
      getSubmissionQueue()
        .then(res => {
          const queue = res.publications || [];
          const usedNames = queue.map(sub => sub.category);
          const usedIds = categories
            .filter(cat => usedNames.includes(cat.name))
            .map(cat => cat.id);
          setCategoriesWithSubmissions(usedIds);
        })
        .catch(err => console.error("Failed to load queue:", err));
    }
  }, [categories, currentUser, step]);

  // ── Auto-save Draft: when title + PDF file are both present, save to DB automatically ──
  useEffect(() => {
    // Only auto-save on step 2 (upload form), when not already a restored draft
    if (step !== 2) return;
    if (publicationDetails.isDraft) return; // already a restored draft
    if (autoSavedDraftRef.current) return; // already auto-saved this session
    if (!publicationDetails.title?.trim()) return;
    if (!publicationDetails.rawFile) return;

    const autoSave = async () => {
      setAutoSaving(true);
      try {
        const pubResult = await onSuccess({
          title: publicationDetails.title,
          categoryId: selectedCategory.id,
          fileObject: publicationDetails.rawFile,
        });
        if (pubResult?.publication?.id) {
          autoSavedDraftRef.current = pubResult.publication.id;
          updatePublicationDetails({
            customPubId: pubResult.publication.id,
            isDraft: true
          });
          setAutoSaved(true);
        }
      } catch (err) {
        console.error("Auto-save draft failed:", err);
      } finally {
        setAutoSaving(false);
      }
    };

    // Small debounce to avoid firing while user is still typing title
    const timer = setTimeout(autoSave, 800);
    return () => clearTimeout(timer);
  }, [step, publicationDetails.title, publicationDetails.rawFile]);

  // Automatically select category and jump to step 2 if categoryId is in URL
  useEffect(() => {
    if (categoryId && categories.length > 0) {
      const matched = categories.find(c => Number(c.id) === Number(categoryId));
      if (matched && (!selectedCategory || Number(selectedCategory.id) !== Number(categoryId))) {
        selectCategory(matched);
      }
    }
  }, [categoryId, categories]);

  // Reset auto-save state when going back to step 1 (categories)
  useEffect(() => {
    if (step === 1) {
      autoSavedDraftRef.current = null;
      setAutoSaved(false);
    }
  }, [step]);

  const handleSelectCategory = (category) => {
    const categoryDraft = drafts.find(d => Number(d.categoryId) === Number(category.id));
    if (categoryDraft) {
      setPendingDraftCategory({ category, draft: categoryDraft });
    } else {
      const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
      navigate(`${prefix}/upload/${category.id}`);
      selectCategory(category);
    }
  };

  const handleContinueDraft = (draft, category) => {
    const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
    navigate(`${prefix}/upload/${category.id}`);
    selectCategory(category);
    autoSavedDraftRef.current = draft.id; // mark as existing draft
    updatePublicationDetails({
      title: draft.title,
      department: '',
      file: { name: `Draft: ${draft.title}.pdf` },
      rawFile: null,
      customPubId: draft.id,
      isDraft: true
    });
    setPendingDraftCategory(null);
  };

  const handleDiscardDraftAndStartNew = async (draft, category) => {
    try {
      if (onCancelSubmission) {
        await onCancelSubmission(draft.id);
      }
      const freshDrafts = await getDrafts();
      setDrafts(freshDrafts || []);
      setPendingDraftCategory(null);
      const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
      navigate(`${prefix}/upload/${category.id}`);
      selectCategory(category);
    } catch (err) {
      console.error(err);
      alert("Failed to discard draft. Please try again.");
    }
  };

  const handleOpenModal = (category = null) => {
    setModalState({ isOpen: true, editingCategory: category });
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, editingCategory: null });
  };

  const handleSaveCategory = async (categoryData) => {
    if (modalState.editingCategory) {
      await updateCategory(modalState.editingCategory.id, categoryData);
    } else {
      await addCategory(categoryData);
    }
    handleCloseModal();
  };

  const handleDeleteCategory = async (category) => {
    try {
      const queue = await getSubmissionQueue();
      // Check if any submission uses this category name
      const hasPublications = queue.some(sub => sub.category === category.name);
      
      if (hasPublications) {
        setDeleteModalState({ isOpen: true, category, mode: 'disablePrompt' });
      } else {
        setDeleteModalState({ isOpen: true, category, mode: 'confirm' });
      }
    } catch (err) {
      setDeleteModalState({ isOpen: true, category, mode: 'confirm' });
    }
  };

  const handleConfirmDelete = async (category) => {
    try {
      await deleteCategory(category.id);
      setDeleteModalState({ isOpen: false, category: null, mode: 'confirm' });
    } catch (err) {
      setDeleteModalState(prev => ({ ...prev, mode: 'disablePrompt' }));
    }
  };

  const handleToggleDisable = (category) => {
    if (disabledCategoryIds.includes(category.id)) {
      enableCategory(category.id);
    } else {
      disableCategory(category.id);
    }
  };

  const handlePayment = async () => {
    let customPubId = publicationDetails.customPubId || autoSavedDraftRef.current;
    let pubResult = customPubId ? { publication: { id: customPubId } } : null;

    try {
      // If auto-save hasn't completed yet (edge case), create it now
      if (!customPubId) {
        if (onSuccess) {
          pubResult = await onSuccess({
            title: publicationDetails.title,
            categoryId: selectedCategory.id,
            fileObject: publicationDetails.rawFile,
          });
        }
        if (!pubResult || !pubResult.publication) {
          throw new Error("Failed to create submission. Cannot proceed.");
        }
        customPubId = pubResult.publication.id;
        autoSavedDraftRef.current = customPubId;
      }

      // If payment is disabled by admin OR category is free → promote Draft to Submitted → success
      if (!isPaymentEnabled || Number(selectedCategory.amount) === 0) {
        await markDraftAsSubmitted(customPubId);
        goToStep(3);
        return;
      }

      // Payment is required — open Razorpay
      const res = await loadRazorpaySDK();
      if (!res) {
        alert("Razorpay SDK failed to load. Are you online?\nYour manuscript has been saved as a Draft.");
        goToStep(1);
        return;
      }

      const order = await processPayment(customPubId);

      const options = {
        key: order.key,
        amount: order.amount.toString(),
        currency: order.currency,
        name: "SNS RPMS",
        description: `Payment for ${customPubId}`,
        order_id: order.order_id,
        handler: async function (response) {
          try {
            await verifyPayment({
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature
            });

            await generateInvoice(
              { amount: order.amount / 100, currency: order.currency, paymentId: response.razorpay_payment_id },
              pubResult.publication,
              currentUser
            );

            goToStep(3);
          } catch (err) {
            alert("Payment verification failed. Your manuscript remains saved as a Draft.\nReason: " + err.message);
            goToStep(1);
          }
        },
        prefill: {
          name: currentUser.name,
          email: currentUser.email,
          contact: currentUser.phone || ""
        },
        theme: {
          color: "#3395FF"
        },
        modal: {
          ondismiss: function () {
            alert("Payment closed. Your manuscript has been saved as a Draft. You can complete the payment anytime by selecting this category again.");
            goToStep(1);
          }
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        alert("Payment failed: " + response.error.description + ". Your manuscript has been saved as a Draft.");
        goToStep(1);
      });
      paymentObject.open();

    } catch (err) {
      console.error(err);
      alert(err.message || "Submission failed. Please try again.");
    }
  };

  const handleBackToCategories = () => {
    const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
    navigate(`${prefix}/upload`);
    resetFlow();
  };

  const handleFullReset = () => {
    const prefix = location.pathname.startsWith('/admin') ? '/admin' : '/faculty';
    navigate(`${prefix}/upload`);
    resetFlow();
  };

  const canCreateCategories = hasFeatureAccess('create_category');
  const visibleCategories = canCreateCategories 
    ? categories 
    : categories.filter(c => !disabledCategoryIds.includes(c.id));

  return (
    <div className="w-full max-w-7xl mx-auto font-sans">
      
      {step === 1 && (
        <div className="space-y-6">
          {categoriesLoading ? (
            <div className="flex justify-center p-10"><div className="animate-spin h-8 w-8 border-4 border-charcoal border-t-transparent rounded-full"></div></div>
          ) : (
            <PublicationCategoryGrid 
              categories={visibleCategories}
              canCreate={canCreateCategories}
              canEdit={hasFeatureAccess('edit')}
              canDelete={hasFeatureAccess('delete')}
              onSelectCategory={handleSelectCategory}
              onEditCategory={handleOpenModal}
              onDeleteCategory={handleDeleteCategory}
              onCreateCategory={() => handleOpenModal()}
              isPaymentEnabled={isPaymentEnabled}
              onTogglePayment={togglePayment}
              disabledCategoryIds={disabledCategoryIds}
              drafts={drafts}
              categoriesWithSubmissions={categoriesWithSubmissions}
              onToggleDisable={handleToggleDisable}
            />
          )}

          <PublicationCategoryModal 
            isOpen={modalState.isOpen}
            category={modalState.editingCategory}
            onClose={handleCloseModal}
            onSave={handleSaveCategory}
          />

          <CategoryDeleteModal
            isOpen={deleteModalState.isOpen}
            category={deleteModalState.category}
            mode={deleteModalState.mode}
            onClose={() => setDeleteModalState({ isOpen: false, category: null, mode: 'confirm' })}
            onDelete={handleConfirmDelete}
            onDisable={handleToggleDisable}
            isDisabled={deleteModalState.category ? disabledCategoryIds.includes(deleteModalState.category.id) : false}
          />

          {pendingDraftCategory && (
            <Modal
              isOpen={!!pendingDraftCategory}
              onClose={() => setPendingDraftCategory(null)}
              title="Pending Draft Found"
              maxWidthClass="max-w-md"
            >
              <div className="space-y-4 text-left font-sans">
                <p className="text-sm text-slate-655 font-medium leading-relaxed">
                  We found an unpaid draft manuscript for this category:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Title</p>
                  <p className="text-sm font-bold text-slate-800">{pendingDraftCategory.draft.title}</p>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Would you like to continue with your draft (skip upload and go directly to payment) or discard it to start a new submission?
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={() => handleContinueDraft(pendingDraftCategory.draft, pendingDraftCategory.category)}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Continue Draft
                  </button>
                  <button
                    onClick={() => handleDiscardDraftAndStartNew(pendingDraftCategory.draft, pendingDraftCategory.category)}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer text-center"
                  >
                    Discard & Start New
                  </button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up w-full mx-auto font-sans">
           <div className="w-full max-w-4xl mx-auto flex justify-center mb-6">
             <div className="w-full flex justify-between items-center bg-pure-white p-4 rounded-2xl border border-platinum-silver shadow-xs transition-all duration-300 hover:scale-[1.005] hover:shadow-md">
               <button
                 onClick={handleBackToCategories}
                 className="px-4 py-2 text-xs font-bold text-charcoal bg-frost-gray hover:bg-mist-silver border border-platinum-silver rounded-lg flex items-center space-x-1.5 cursor-pointer transition-colors"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-4 w-4 mr-1.5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                 <span>Back to Categories</span>
               </button>
               {/* Auto-save status indicator */}
               <div className="flex items-center space-x-2">
                 {autoSaving && (
                   <span className="flex items-center text-xs text-amber-600 font-medium animate-pulse">
                     <svg className="animate-spin h-3.5 w-3.5 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                     </svg>
                     Saving draft...
                   </span>
                 )}
                 {autoSaved && !autoSaving && (
                   <span className="flex items-center text-xs text-emerald-600 font-medium">
                     <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                     Draft saved
                   </span>
                 )}
               </div>
             </div>
           </div>
           <PublicationUploadForm 
             currentUser={currentUser}
             selectedCategory={selectedCategory}
             publicationDetails={publicationDetails}
             onUpdateDetails={updatePublicationDetails}
             onNext={handlePayment}
             isSubmitting={paymentLoading || autoSaving}
             isPaymentEnabled={isPaymentEnabled}
           />
        </div>
      )}



      {(step === 3 || step === 4) && (
        <div className="animate-slide-up">
          <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-black text-slate-900">Submission Successful!</h3>
            <p className="text-sm text-slate-500">Your manuscript has been submitted and is now pending review.</p>
            <button
              onClick={handleFullReset}
              className="mt-4 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all cursor-pointer"
            >
              Submit Another Publication
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
