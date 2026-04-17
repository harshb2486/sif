// OpenAI Chatbot Service
// Handles interactions with OpenAI API and sales context

const { OpenAI } = require('openai');
const logger = require('../utils/logger');
const Product = require('../models/Product');
const User = require('../models/User');

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Build system prompt with sales context
 */
const buildSystemPrompt = (userData, products) => {
  const productInfo = products
    .map(p => `- ${p.name}: $${p.price} (${p.commission_type === 'fixed' ? `$${p.commission_value}` : p.commission_value + '%'} commission)`)
    .join('\n');

  return `You are a helpful Sales Assistant for the Field Sales Management System. 
Your role is to help sales representatives with:
1. Product information and pricing
2. Commission calculations
3. Sales strategies and tips
4. Customer engagement advice
5. Sales data insights

Sales Representative: ${userData.name}
Company: ${userData.company_name}
Role: ${userData.role}

AVAILABLE PRODUCTS:
${productInfo || 'No products available'}

IMPORTANT GUIDELINES:
- Always be professional and supportive
- Provide accurate commission calculations
- Offer practical sales advice
- Be concise and clear
- If asked about features outside your scope, politely redirect to the appropriate team
- Never provide personal financial or investment advice
- Always prioritize customer satisfaction

Format responses clearly with bullet points when listing information.`;
};

/**
 * Calculate commission for a sale
 */
const calculateCommission = (productPrice, commissionType, commissionValue) => {
  if (commissionType === 'percentage') {
    return (productPrice * commissionValue) / 100;
  } else {
    return commissionValue;
  }
};

/**
 * Get sales context for the user
 */
const getSalesContext = async (userId, companyId) => {
  try {
    // Get user info
    const user = await User.findUserById(userId);
    if (!user) throw new Error('User not found');

    // Get company products
    const products = await Product.getProductsByCompanyId(companyId);

    // Build context object
    return {
      userId,
      companyId,
      userName: user.name,
      userRole: user.role,
      products: products || [],
      companyName: user.company_name || 'Company'
    };
  } catch (error) {
    logger.error('Failed to get sales context', { userId, companyId, error: error.message });
    return { userId, companyId, products: [] };
  }
};

/**
 * Send message to OpenAI and get response
 */
const chat = async (userMessage, conversationHistory, context) => {
  try {
    const systemPrompt = buildSystemPrompt(context, context.products || []);

    // Format messages for API
    const messages = [
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user',
        content: userMessage
      }
    ];

    logger.debug('Sending message to OpenAI', { messageCount: messages.length });

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        ...messages
      ],
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
      top_p: 0.9
    });

    const assistantMessage = response.choices[0].message.content;
    const tokensUsed = response.usage.total_tokens;

    logger.info('OpenAI response received', {
      tokensUsed,
      model: response.model,
      finishReason: response.choices[0].finish_reason
    });

    return {
      message: assistantMessage,
      tokensUsed,
      model: response.model,
      metadata: {
        finishReason: response.choices[0].finish_reason,
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens
      }
    };
  } catch (error) {
    logger.error('OpenAI API error', { error: error.message, status: error.status });
    
    // Fallback response if API fails
    if (error.status === 401) {
      throw new Error('Invalid OpenAI API key. Please check your configuration.');
    } else if (error.status === 429) {
      throw new Error('OpenAI rate limit exceeded. Please try again in a moment.');
    }
    
    throw new Error(`Failed to get response from OpenAI: ${error.message}`);
  }
};

/**
 * Generate conversation title from initial message
 */
const generateConversationTitle = (initialMessage) => {
  // Truncate and create title from first message
  const maxLength = 50;
  if (initialMessage.length <= maxLength) {
    return initialMessage;
  }
  return initialMessage.substring(0, maxLength - 3) + '...';
};

module.exports = {
  chat,
  getSalesContext,
  calculateCommission,
  generateConversationTitle,
  buildSystemPrompt
};
