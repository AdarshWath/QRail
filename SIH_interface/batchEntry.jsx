import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Batch } from "@/entities/Batch";
import AuthWrapper from "../components/AuthWrapper";
import BatchForm from "../components/BatchForm";

function BatchEntryContent() {
  const navigate = useNavigate();

  const handleBatchSubmit = async (batchData) => {
    try {
      await Batch.create(batchData);
      navigate(createPageUrl("Scanner"));
    } catch (error) {
      console.error("Error creating batch:", error);
    }
  };

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--railway-gray)' }}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--railway-blue)' }}>
            New Batch Entry
          </h1>
          <p className="text-gray-500 mt-4">
            Fill in the batch details once. This information will be used for all items in this batch.
          </p>
        </div>

        <BatchForm onSubmit={handleBatchSubmit} />
      </div>
    </div>
  );
}

export default function BatchEntry() {
  return (
    <AuthWrapper>
      <BatchEntryContent />
    </AuthWrapper>
  );
}