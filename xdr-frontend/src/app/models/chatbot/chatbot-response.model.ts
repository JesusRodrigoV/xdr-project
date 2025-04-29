export interface ChatbotResponse {
  success: boolean;
  data: {
    response: string;
    model: string;
  };
}
