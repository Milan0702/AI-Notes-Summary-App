import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

type SummarizePayload = {
  noteId: string;
};

type SummarizeResponse = {
  summary: string;
};

const summarizeNoteApiCall = async (payload: SummarizePayload): Promise<SummarizeResponse> => {
  const response = await fetch('/api/summarize', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    let errorData;
    try {
      // Try to parse JSON error
      errorData = await response.json();
    } catch {
      // If JSON parsing fails, fallback to error object
      errorData = { error: `Request failed with status ${response.status}` };
    }
    
    // Special handling for common errors
    if (response.status === 402) {
      throw new Error('AI service quota exceeded. Please check your API usage limits.');
    } else if (response.status === 400) {
      throw new Error(errorData.error || 'Invalid request to AI service. Please try again.');
    }
    
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }

  return await response.json();
};

export const useSummarizeNote = () => {
  const { mutate: summarizeNote, isPending: isSummarizing, data: summaryData, error } = useMutation<SummarizeResponse, Error, SummarizePayload>({
    mutationFn: summarizeNoteApiCall,
    onSuccess: () => {
      // Summary data is available in `data.summary`
      // We don't show a global toast here, let the component decide how to display it.
    },
    onError: (error) => {
      // Display a user-friendly error message
      if (error.message.includes('API usage limit') || error.message.includes('quota exceeded')) {
        toast.error('AI service usage limit reached', {
          description: 'The summarization feature is temporarily unavailable.'
        });
      } else if (error.message.includes('Invalid request')) {
        toast.error('Couldn\'t generate summary', {
          description: 'There was an issue with the request to the AI service. Please try again.'
        });
      } else {
        toast.error(`Failed to summarize: ${error.message}`);
      }
    },
  });

  return {
    summarizeNote,
    isSummarizing,
    summary: summaryData?.summary,
    error,
  };
}; 