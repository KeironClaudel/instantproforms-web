export type FeedbackState = {
  type: "success" | "error";
  message: string;
};

export function createSuccessFeedback(message: string): FeedbackState {
  return {
    type: "success",
    message,
  };
}

export function createErrorFeedback(message: string): FeedbackState {
  return {
    type: "error",
    message,
  };
}